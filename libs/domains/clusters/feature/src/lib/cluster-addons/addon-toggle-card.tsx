import { Badge, Button, Icon } from '@qovery/shared/ui'

export interface AddonToggleCardProps {
  title: string
  description: string
  badge?: { label: string; color: 'yellow' | 'green' }
  activated: boolean
  onToggle: () => void
  activateLabel?: string
  loading?: boolean
}

export function AddonToggleCard({
  title,
  description,
  badge,
  activated,
  onToggle,
  activateLabel = 'Activate',
  loading = false,
}: AddonToggleCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral">{title}</span>
          {badge && (
            <Badge size="sm" radius="full" variant="surface" color={badge.color} className="text-[13px]">
              {badge.label}
            </Badge>
          )}
        </div>
        <p className="text-sm text-neutral-subtle">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          color="neutral"
          variant={activated ? 'surface' : 'outline'}
          size="md"
          className="gap-2"
          onClick={onToggle}
          loading={loading}
        >
          <Icon iconName="circle-check" iconStyle="regular" className="text-xs" />
          {activated ? 'Activated' : activateLabel}
        </Button>
      </div>
    </div>
  )
}
