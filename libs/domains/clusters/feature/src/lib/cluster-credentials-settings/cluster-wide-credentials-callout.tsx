import { Button, Callout, Icon } from '@qovery/shared/ui'
import { useWideCredentialsInstructions } from '../hooks/use-wide-credentials-instructions/use-wide-credentials-instructions'

export function ClusterWideCredentialsCallout() {
  const { isRequired, openInstructions } = useWideCredentialsInstructions()

  if (!isRequired) return null

  return (
    <Callout.Root color="yellow" className="flex-wrap items-center gap-y-3">
      <Callout.Icon>
        <Icon iconName="triangle-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text className="min-w-0 flex-1">Extended credentials required</Callout.Text>
      <Button type="button" color="neutral" variant="outline" size="sm" onClick={openInstructions}>
        View instructions
      </Button>
    </Callout.Root>
  )
}
