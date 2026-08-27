import { Badge, Icon, Tooltip } from '@qovery/shared/ui'

export function BlueprintRcBadge() {
  return (
    <Tooltip content="This service runs a prerelease blueprint version built for an open pull request. It is meant for testing and stops being deployable once that pull request closes.">
      <Badge variant="surface" color="yellow" className="cursor-default gap-1 whitespace-nowrap font-medium">
        <Icon className="h-3 w-3" iconName="flask" iconStyle="regular" />
        RC test
      </Badge>
    </Tooltip>
  )
}

export default BlueprintRcBadge
