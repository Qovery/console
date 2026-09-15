import { Button, Icon } from '@qovery/shared/ui'

export function QoveryServiceContextCard({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      color="neutral"
      className="h-[140px] w-full max-w-80 flex-col items-start justify-between whitespace-normal rounded-lg p-4 text-left transition-colors active:scale-100"
      onClick={onClick}
    >
      <Icon iconName="cubes" iconStyle="regular" className="text-lg" />
      <span className="flex flex-col gap-0.5">
        <span className="text-ssm font-medium leading-[18px] text-neutral">Add Qovery services</span>
        <span className="text-xs font-normal leading-4 text-neutral-subtle">
          Select services from this environment to add to the agent&apos;s context.
        </span>
      </span>
    </Button>
  )
}

export function QoveryServiceContextCompactCard({ names, onClick }: { names: string[]; onClick: () => void }) {
  return (
    <div className="relative flex h-[74px] min-w-0 flex-col justify-between rounded-lg border border-neutral bg-surface-neutral p-3 pr-12">
      <span className="flex h-5 w-fit items-center gap-1 rounded bg-surface-neutral-component pl-1 pr-1.5 text-[10px] font-medium leading-5 text-neutral">
        <Icon iconName="cubes" iconStyle="regular" className="text-xs" />
        Qovery services
      </span>
      <div className="min-w-0 truncate text-sm text-neutral">{names.join(', ')}</div>
      <Button
        type="button"
        variant="outline"
        color="neutral"
        size="xs"
        iconOnly
        aria-label="Manage Qovery service context"
        className="absolute right-3 top-1/2 -translate-y-1/2"
        onClick={onClick}
      >
        <Icon iconName="gear" />
      </Button>
    </div>
  )
}
