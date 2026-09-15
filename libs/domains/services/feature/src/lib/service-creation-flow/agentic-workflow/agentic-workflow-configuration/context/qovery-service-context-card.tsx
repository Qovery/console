import { IconEnum } from '@qovery/shared/enums'
import { Button, Icon } from '@qovery/shared/ui'

export function QoveryServiceContextCompactCard({ names, onClick }: { names: string[]; onClick: () => void }) {
  return (
    <div className="relative flex h-[74px] w-full min-w-0 max-w-80 flex-col justify-between rounded-lg border border-neutral bg-surface-neutral p-3 pr-12">
      <span className="flex h-5 w-fit items-center gap-1 rounded bg-surface-neutral-component pl-1 pr-1.5 text-[10px] font-medium leading-5 text-neutral">
        <Icon name={IconEnum.QOVERY} width={12} height={12} />
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
