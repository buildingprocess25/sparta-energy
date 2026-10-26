import { IconBroadcast, IconCircleCheck, IconFlame } from "@tabler/icons-react"

import type { FilterFieldConfig } from "@/components/reui/filters"

export const validationFilterField: FilterFieldConfig<string> = {
  key: "validation",
  label: "Status Validasi",
  type: "select",
  icon: <IconCircleCheck />,
  options: [
    { value: "pending", label: "Menunggu validasi" },
    { value: "validated", label: "Sudah divalidasi" },
  ],
}

export const priorityFilterField: FilterFieldConfig<string> = {
  key: "priority",
  label: "Prioritas",
  type: "select",
  icon: <IconFlame />,
  options: [{ value: "sangat-boros", label: "Sangat Boros (12 teratas)" }],
}

export const iotFilterField: FilterFieldConfig<string> = {
  key: "iot",
  label: "IoT",
  type: "select",
  icon: <IconBroadcast />,
  options: [
    { value: "installed", label: "Sudah dipasang" },
    { value: "not-installed", label: "Belum dipasang" },
  ],
}
