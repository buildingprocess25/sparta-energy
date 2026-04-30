"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import {
  IconCheck,
  IconChevronDown,
  IconLoader2,
  IconSearch,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { StoreData } from "@/app/audit/start/start-client"

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10

// ─── Sub-components ───────────────────────────────────────────────────────────

function StoreComboboxTrigger({
  selected,
  open,
}: {
  selected: StoreData | null
  open: boolean
}) {
  return (
    <PopoverPrimitive.Trigger asChild>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        suppressHydrationWarning
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="truncate">
          {selected ? `${selected.code} - ${selected.name}` : "Pilih toko..."}
        </span>
        <IconChevronDown
          className={cn(
            "ml-2 size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
    </PopoverPrimitive.Trigger>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type StoreComboboxProps = {
  stores: StoreData[]
  value: StoreData | null
  onSelect: (store: StoreData) => void
  placeholder?: string
}

export function StoreCombobox({
  stores,
  value,
  onSelect,
  placeholder = "Cari kode atau nama toko...",
}: StoreComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)

  const listRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Filter stores based on search query
  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return stores
    return stores.filter(
      (s) =>
        s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    )
  }, [stores, query])

  // Visible slice (for pagination)
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  // Reset pagination when query changes
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query])

  const maybeLoadMore = React.useCallback(() => {
    const list = listRef.current
    if (!list || !hasMore || isLoadingMore) return

    const { scrollTop, clientHeight, scrollHeight } = list
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 24

    if (nearBottom) {
      setIsLoadingMore(true)
      // Small delay to simulate async feel
      setTimeout(() => {
        setVisibleCount((prev) => prev + PAGE_SIZE)
        setIsLoadingMore(false)
      }, 150)
    }
  }, [hasMore, isLoadingMore])

  // Auto-load when list isn't scrollable yet
  React.useEffect(() => {
    if (open) {
      maybeLoadMore()
    }
  }, [open, visibleCount, maybeLoadMore])

  // Focus input when popover opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setQuery("")
      setVisibleCount(PAGE_SIZE)
    }
  }, [open])

  function handleSelect(store: StoreData) {
    onSelect(store)
    setOpen(false)
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <StoreComboboxTrigger selected={value} open={open} />

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={6}
          align="start"
          className={cn(
            "z-50 w-(--radix-popover-trigger-width) overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          )}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <IconSearch className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              role="searchbox"
              aria-label="Cari toko"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* List */}
          <div
            role="listbox"
            aria-label="Daftar toko"
            ref={listRef}
            onScroll={maybeLoadMore}
            className="max-h-64 overflow-y-auto py-1"
          >
            {visible.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Tidak ada toko yang cocok.
              </div>
            ) : (
              <>
                {visible.map((store) => {
                  const isSelected = value?.code === store.code
                  return (
                    <button
                      key={store.code}
                      role="option"
                      aria-selected={isSelected}
                      type="button"
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm transition-colors",
                        "hover:bg-foreground/10 hover:text-foreground",
                        "focus-visible:bg-foreground/10 focus-visible:text-foreground focus-visible:outline-none",
                        isSelected && "bg-foreground/10 font-medium"
                      )}
                      onClick={() => handleSelect(store)}
                    >
                      <div>
                        <span className="font-semibold text-foreground">
                          {store.code}
                        </span>
                        <span className="mx-1.5 text-muted-foreground">-</span>
                        <span>{store.name}</span>
                        <div className="text-xs text-muted-foreground">
                          {store.type} · {store.branch}
                        </div>
                      </div>
                      {isSelected && (
                        <IconCheck className="ml-2 size-4 shrink-0 text-primary" />
                      )}
                    </button>
                  )
                })}

                {/* Infinite scroll sentinel */}
                {hasMore && (
                  <div className="flex items-center justify-center py-2">
                    {isLoadingMore ? (
                      <IconLoader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Gulir untuk muat lebih banyak
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
