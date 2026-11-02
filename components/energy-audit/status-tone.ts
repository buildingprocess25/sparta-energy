// Badge colors for audit results, matching the lighting form.
export const statusTone = {
  good: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  warn: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  bad: "border-transparent bg-[#c54b45] text-white",
  idle: "text-muted-foreground",
} as const
