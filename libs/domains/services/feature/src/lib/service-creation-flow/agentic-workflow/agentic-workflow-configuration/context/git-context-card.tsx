import { IconEnum } from '@qovery/shared/enums'
import { Button, Icon } from '@qovery/shared/ui'

export function GitContextCard({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      color="neutral"
      className="h-[140px] w-80 flex-col items-start justify-between whitespace-normal rounded-lg p-4 text-left transition-colors active:scale-100"
      onClick={onClick}
    >
      <Icon name={IconEnum.GIT} width={18} height={18} />
      <span className="flex flex-col gap-0.5">
        <span className="text-ssm font-medium leading-[18px] text-neutral">Add from Git repository</span>
        <span className="text-xs font-normal leading-4 text-neutral-subtle">
          Add a Git repository to load as the agent&apos;s context.
        </span>
      </span>
    </Button>
  )
}

export function GitContextCompactCard({
  onClick,
  provider,
  repository,
}: {
  onClick: () => void
  provider?: string | null
  repository: string
}) {
  return (
    <div className="relative flex h-[74px] min-w-0 flex-col justify-between rounded-lg border border-neutral bg-surface-neutral p-3 pr-12">
      <span className="flex h-5 w-fit items-center gap-1 rounded bg-surface-neutral-component pl-1 pr-1.5 text-[10px] font-medium uppercase leading-5 text-neutral">
        <Icon name={provider ?? IconEnum.GIT} width={12} height={12} />
        {provider ?? 'Git'}
      </span>
      <div className="min-w-0 truncate text-sm text-neutral">{repository}</div>
      <Button
        type="button"
        variant="outline"
        color="neutral"
        size="xs"
        iconOnly
        aria-label="Manage context"
        className="absolute right-3 top-1/2 -translate-y-1/2"
        onClick={onClick}
      >
        <Icon iconName="gear" />
      </Button>
    </div>
  )
}
