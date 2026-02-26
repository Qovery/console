import { Button, Icon } from '@qovery/shared/ui'

export interface EmptyStateProps {
  docLinks: Array<{ label: string; link: string }>
  expand: boolean
  onSuggestionClick: (label: string) => void
  threadLength: number
}

export function EmptyState({ docLinks, expand, onSuggestionClick, threadLength }: EmptyStateProps) {
  if (threadLength > 0 || docLinks.length === 0 || !expand) return null

  return (
    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-2 text-center">
      <Icon
        iconName="sparkles"
        iconStyle="light"
        className="mb-4 animate-[fadein_0.4s_ease-in-out_forwards_0.05s] text-[48px] text-brand-500 opacity-0"
      />
      <span className="animate-[fadein_0.4s_ease-in-out_forwards_0.22s] text-[11px] font-semibold text-neutral-400 opacity-0 dark:text-white">
        Ask for a contextual suggestion:
      </span>
      <div className="flex max-w-[850px] animate-[fadein_0.4s_ease-in-out_forwards_0.15s] flex-wrap justify-center gap-3 opacity-0">
        {docLinks.map(({ label, link }) => (
          <Button
            key={`${label}${link}`}
            type="button"
            variant="surface"
            className="inline-flex max-w-max gap-2"
            radius="full"
            onClick={() => onSuggestionClick(label)}
          >
            <Icon iconName="arrow-right" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
