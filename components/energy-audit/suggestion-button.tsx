import { IconWand } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

type SuggestionButtonProps = {
  text: string
  onUse: () => void
}

// Offers text derived from the results; the auditor decides whether it goes in.
export function SuggestionButton({ text, onUse }: SuggestionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-auto min-h-11 justify-start text-left text-xs whitespace-normal text-primary"
      onClick={onUse}
    >
      <IconWand data-icon="inline-start" />
      Pakai saran: {text}
    </Button>
  )
}
