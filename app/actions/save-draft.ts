"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getServerErrorMessage } from "@/lib/error-handling"
import type { EquipmentState, PlnRowState, StoreType } from "@/store/use-audit-store"
import type { AreaTarget } from "@prisma/client"

// Helper to map area target names
function toAreaTarget(areaName: string): AreaTarget {
  const name = areaName.toLowerCase()
  if (name.includes("parkir")) return "PARKING"
  if (name.includes("teras")) return "TERRACE"
  if (name.includes("sales")) return "SALES"
  return "WAREHOUSE"
}

function getSingleDuration(start: string, end: string) {
  if (!start || !end) return 14
  if (start === "00:00" && (end === "23:59" || end === "00:00" || end === "24:00")) {
    return 24
  }
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  let diffMinutes = eh * 60 + em - (sh * 60 + sm)
  if (diffMinutes <= 0) diffMinutes += 24 * 60
  return diffMinutes / 60
}

type SaveDraftInput = {
  auditId?: string | null
  storeCode: string
  storeType?: string
  is24Hours?: boolean
  openTime?: string
  closeTime?: string
  plnPowerVa?: number
  areas?: {
    sales: number
    parkir: number
    teras: number
    gudang: number
  }
  equipments?: EquipmentState[]
  plnHistory?: PlnRowState[]
  savedAreas?: string[]
}

export async function saveAuditDraft(input: SaveDraftInput) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return {
        error: {
          type: "auth",
          message: "Sesi Anda telah berakhir. Silakan login kembali.",
        },
      }
    }

    const userId = session.user.id

    // 1. Resolve store ID
    const store = await prisma.store.findUnique({
      where: { code: input.storeCode },
      select: { id: true },
    })

    if (!store) {
      return {
        error: {
          type: "validation",
          message: "Toko tidak ditemukan.",
        },
      }
    }

    const storeId = store.id

    // 2. Update store data if parameters are provided (from Step 1)
    if (input.storeType !== undefined) {
      await prisma.store.update({
        where: { id: storeId },
        data: {
          type: input.storeType,
          is24Hours: input.is24Hours,
          openTime: input.is24Hours ? null : input.openTime,
          closeTime: input.is24Hours ? null : input.closeTime,
          plnPowerVa: input.plnPowerVa,
          salesAreaM2: input.areas?.sales,
          parkingAreaM2: input.areas?.parkir,
          terraceAreaM2: input.areas?.teras,
          warehouseAreaM2: input.areas?.gudang,
        },
      })
    }

    // 3. Create or update Audit record
    let audit
    if (input.auditId) {
      audit = await prisma.audit.update({
        where: { id: input.auditId },
        data: {
          storeId,
          auditorId: userId,
          status: "DRAFT",
          auditDate: new Date(),
        },
      })
    } else {
      audit = await prisma.audit.create({
        data: {
          storeId,
          auditorId: userId,
          status: "DRAFT",
          auditDate: new Date(),
        },
      })
    }

    const auditId = audit.id

    // 4. Update AuditItems (if provided)
    if (input.equipments) {
      // Delete existing items
      await prisma.auditItem.deleteMany({
        where: { auditId },
      })

      // Fetch all equipment types to map name -> id, calcMethod, calcDuration
      const eqTypes = await prisma.equipmentType.findMany({
        select: { id: true, name: true, calcMethod: true, calcDuration: true },
      })
      const eqTypeMap = new Map(eqTypes.map((t) => [t.name.toLowerCase().trim(), t]))

      // We only insert items that are configured/selected or present in equipments
      const selectedEquipments = input.equipments.filter((eq) => eq.selected)
      if (selectedEquipments.length > 0) {
        const itemsToCreate = []
        for (const eq of selectedEquipments) {
          const typeInfo = eqTypeMap.get(eq.name.toLowerCase().trim())
          const eqTypeId = typeInfo?.id ?? null
          const method = typeInfo?.calcMethod ?? eq.calcMethod ?? "STANDARD"
          const duration = typeInfo?.calcDuration ?? eq.calcDuration ?? 0

          const isAC =
            eq.name.toLowerCase().includes("ac") ||
            eq.name.toLowerCase().includes("air conditioner")

          if (isAC && eq.quantity > 1) {
            for (let i = 0; i < eq.quantity; i++) {
              const start = eq.startTimes?.[i] || "08:00"
              const end = eq.endTimes?.[i] || "22:00"
              const hours = getSingleDuration(start, end)
              const bKw = eq.kws?.[i] ?? eq.kw ?? 0

              itemsToCreate.push({
                auditId,
                equipmentTypeId: eqTypeId,
                areaTarget: toAreaTarget(eq.areaName),
                customName: eq.name,
                notes: eq.notes?.trim() || null,
                brandName: eq.brandNames?.[i] ?? eq.brandName ?? "",
                equipmentBrandId: eq.brandIds?.[i] ?? eq.brandId ?? null,
                qty: 1,
                operationalHours: hours,
                baseKw: bKw,
                estimatedDailyKwh: bKw * hours,
              })
            }
          } else {
            const start = eq.startTimes?.[0] || "08:00"
            const end = eq.endTimes?.[0] || "22:00"
            const hours = getSingleDuration(start, end)
            const bKw = eq.kws?.[0] ?? eq.kw ?? 0
            const usageVal = eq.usages?.[0] ?? 0

            let estDailyKwh = bKw * eq.quantity * hours
            if (method === "TRANSACTION" || method === "BATCH") {
              const hrsRunning = Math.min((usageVal * duration) / 3600, hours)
              const hrsStandby = Math.max(0, hours - hrsRunning)
              const runningKwVal = eq.runningKws?.[0] ?? bKw
              const standbyKwVal = eq.standbyKws?.[0] ?? (runningKwVal * 0.05)
              estDailyKwh = ((runningKwVal * hrsRunning) + (standbyKwVal * hrsStandby)) * eq.quantity
            }

            itemsToCreate.push({
              auditId,
              equipmentTypeId: eqTypeId,
              areaTarget: toAreaTarget(eq.areaName),
              customName: eq.name,
              notes: eq.notes?.trim() || null,
              brandName: eq.brandNames?.[0] ?? eq.brandName ?? "",
              equipmentBrandId: eq.brandIds?.[0] ?? eq.brandId ?? null,
              qty: eq.quantity,
              operationalHours: hours,
              baseKw: bKw,
              estimatedDailyKwh: estDailyKwh,
              usageCount: (method === "TRANSACTION" || method === "BATCH") ? usageVal : null,
            })
          }
        }

        if (itemsToCreate.length > 0) {
          await prisma.auditItem.createMany({
            data: itemsToCreate,
          })
        }
      }
    }

    // 5. Update PLN History (if provided)
    if (input.plnHistory) {
      await prisma.auditPlnStdHistory.deleteMany({
        where: { auditId },
      })

      if (input.plnHistory.length > 0) {
        await prisma.auditPlnStdHistory.createMany({
          data: input.plnHistory.map((row, idx) => ({
            auditId,
            monthIdx: idx + 1,
            billingMonth: row.month,
            plnUsageKwh: row.kwh,
            salesTransactionPerDay: row.std,
          })),
        })
      }
    }

    return { success: true, auditId }
  } catch (error) {
    return {
      error: {
        type: "server",
        message: getServerErrorMessage(error),
      },
    }
  }
}

export async function getAuditDraft(auditId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return {
        error: {
          type: "auth",
          message: "Sesi Anda telah berakhir. Silakan login kembali.",
        },
      }
    }

    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        auditorId: session.user.id,
        status: "DRAFT",
      },
      include: {
        store: true,
        items: {
          include: {
            equipmentType: true,
            equipmentBrand: true,
          },
        },
        plnHistory: {
          orderBy: { monthIdx: "asc" },
        },
      },
    })

    if (!audit) {
      return {
        error: {
          type: "validation",
          message: "Draf audit tidak ditemukan.",
        },
      }
    }

    const fromAreaTarget = (target: AreaTarget) => {
      if (target === "PARKING") return "Parkiran"
      if (target === "TERRACE") return "Teras"
      if (target === "SALES") return "Sales"
      return "Gudang, Toilet & Selasar"
    }

    const storeIs24Hours = Boolean(audit.store.is24Hours)
    const storeOpenTime = audit.store.openTime || "07:00"

    const formatTime = (hours: number) => {
      // 24 hours detection: only when the equipment itself operates ~24 hours
      if (hours >= 23.8) {
        return {
          start: "00:00",
          end: "23:59",
        }
      }

      const defaultOpen = (storeOpenTime && storeOpenTime !== "00:00") ? storeOpenTime : "08:00"
      const [sh, sm] = defaultOpen.split(":").map(Number)
      const totalMinutes = (sh * 60 + sm) + Math.round(hours * 60)
      const endH = Math.floor(totalMinutes / 60) % 24
      const endM = totalMinutes % 60
      const pad = (n: number) => String(n).padStart(2, "0")
      return {
        start: `${pad(sh)}:${pad(sm)}`,
        end: `${pad(endH)}:${pad(endM)}`,
      }
    }

    const equipments: EquipmentState[] = []
    const savedAreasSet = new Set<string>()

    const parseNameAndNotes = (rawName: string | null) => {
      const str = rawName || ""
      const noteMatch = str.match(/\s*\[NOTE:(.*)\]$/)
      const cleanName = noteMatch ? str.replace(/\s*\[NOTE:(.*)\]$/, "") : str
      const notes = noteMatch ? noteMatch[1].trim() : undefined
      return { cleanName, notes }
    }

    // Separate AC items (grouped to reconstruct per-unit AC state) and non-AC items (each preserved independently)
    const acGroups: Record<string, typeof audit.items> = {}
    const nonAcItems: (typeof audit.items)[number][] = []

    audit.items.forEach((item) => {
      const { cleanName } = parseNameAndNotes(item.customName)
      const isAC =
        cleanName.toLowerCase().includes("ac") ||
        cleanName.toLowerCase().includes("air conditioner")
      if (isAC) {
        const key = `${item.areaTarget}-${item.customName}`
        if (!acGroups[key]) {
          acGroups[key] = []
        }
        acGroups[key].push(item)
      } else {
        nonAcItems.push(item)
      }
    })

    // 1. Process AC groups
    Object.entries(acGroups).forEach(([, items]) => {
      const first = items[0]
      const areaName = fromAreaTarget(first.areaTarget)
      savedAreasSet.add(areaName)

      const { cleanName, notes: parsedNote } = parseNameAndNotes(first.customName)
      const itemNotes = first.notes || parsedNote

      const quantity = items.length
      const startTimes: string[] = []
      const endTimes: string[] = []
      const brandIds: (string | undefined)[] = []
      const brandNames: string[] = []
      const kws: number[] = []
      const usagesArr: number[] = []
      const runningKwsArr: number[] = []
      const standbyKwsArr: number[] = []

      items.forEach((item) => {
        const t = formatTime(Number(item.operationalHours))
        startTimes.push(t.start)
        endTimes.push(t.end)
        brandIds.push(item.equipmentBrandId || undefined)
        brandNames.push(item.brandName || "")
        kws.push(Number(item.baseKw))
        usagesArr.push(0)
        runningKwsArr.push(Number(item.equipmentBrand?.runningKw ?? item.baseKw))
        standbyKwsArr.push(Number(item.equipmentBrand?.standbyKw ?? Number(item.baseKw) * 0.05))
      })

      equipments.push({
        id: first.id,
        areaName,
        name: cleanName || "",
        notes: itemNotes,
        brandId: first.equipmentBrandId || undefined,
        brandName: first.brandName || undefined,
        brandIds,
        brandNames,
        kw: Number(first.baseKw),
        kws,
        quantity,
        startTimes,
        endTimes,
        selected: true,
        isConfigured: true,
        calcMethod: first.equipmentType?.calcMethod ?? "STANDARD",
        calcDuration: first.equipmentType?.calcDuration ?? 0,
        usages: usagesArr,
        runningKws: runningKwsArr,
        standbyKws: standbyKwsArr,
      })
    })

    // 2. Process non-AC items independently (preserves multiple separate items of same type)
    nonAcItems.forEach((item) => {
      const areaName = fromAreaTarget(item.areaTarget)
      savedAreasSet.add(areaName)

      const { cleanName, notes: parsedNote } = parseNameAndNotes(item.customName)
      const itemNotes = item.notes || parsedNote

      const quantity = item.qty || 1
      const t = formatTime(Number(item.operationalHours))
      const startTimes = Array(quantity).fill(t.start)
      const endTimes = Array(quantity).fill(t.end)
      const brandIds = Array(quantity).fill(item.equipmentBrandId || undefined)
      const brandNames = Array(quantity).fill(item.brandName || "")
      const kws = Array(quantity).fill(Number(item.baseKw))

      const usageVal = item.usageCount ?? (item.equipmentType?.calcMethod === "TRANSACTION" ? 50 : item.equipmentType?.calcMethod === "BATCH" ? 6 : 0)
      const usagesArr = Array(quantity).fill(usageVal)
      const runningKwsArr = Array(quantity).fill(Number(item.equipmentBrand?.runningKw ?? item.baseKw))
      const standbyKwsArr = Array(quantity).fill(Number(item.equipmentBrand?.standbyKw ?? Number(item.baseKw) * 0.05))

      equipments.push({
        id: item.id,
        areaName,
        name: cleanName || "",
        notes: itemNotes,
        brandId: item.equipmentBrandId || undefined,
        brandName: item.brandName || undefined,
        brandIds,
        brandNames,
        kw: Number(item.baseKw),
        kws,
        quantity,
        startTimes,
        endTimes,
        selected: true,
        isConfigured: true,
        calcMethod: item.equipmentType?.calcMethod ?? "STANDARD",
        calcDuration: item.equipmentType?.calcDuration ?? 0,
        usages: usagesArr,
        runningKws: runningKwsArr,
        standbyKws: standbyKwsArr,
      })
    })

    const plnHistory: PlnRowState[] = audit.plnHistory.map((h) => ({
      month: h.billingMonth,
      kwh: Number(h.plnUsageKwh),
      std: Number(h.salesTransactionPerDay),
    }))

    const draftData = {
      auditId: audit.id,
      storeCode: audit.store.code,
      storeName: audit.store.name,
      storeType: audit.store.type as StoreType,
      is24Hours: audit.store.is24Hours,
      openTime: audit.store.openTime || "07:00",
      closeTime: audit.store.closeTime || "22:00",
      plnPowerVa: audit.store.plnPowerVa,
      areas: {
        sales: Number(audit.store.salesAreaM2),
        parkir: Number(audit.store.parkingAreaM2),
        teras: Number(audit.store.terraceAreaM2),
        gudang: Number(audit.store.warehouseAreaM2),
      },
      equipments,
      savedAreas: Array.from(savedAreasSet),
      plnHistory,
    }

    return { success: true, draftData }
  } catch (error) {
    return {
      error: {
        type: "server",
        message: getServerErrorMessage(error),
      },
    }
  }
}

export async function deleteAuditDraft(auditId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return {
        error: {
          type: "auth",
          message: "Sesi Anda telah berakhir. Silakan login kembali.",
        },
      }
    }

    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        auditorId: session.user.id,
        status: "DRAFT",
      },
    })

    if (!audit) {
      return {
        error: {
          type: "validation",
          message: "Draf audit tidak ditemukan.",
        },
      }
    }

    await prisma.auditItem.deleteMany({ where: { auditId } })
    await prisma.auditPlnStdHistory.deleteMany({ where: { auditId } })
    await prisma.audit.delete({ where: { id: auditId } })

    return { success: true }
  } catch (error) {
    return {
      error: {
        type: "server",
        message: getServerErrorMessage(error),
      },
    }
  }
}
