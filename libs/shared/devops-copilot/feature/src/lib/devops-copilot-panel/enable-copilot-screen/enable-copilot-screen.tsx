import { Button, EmptyState, Icon, Link } from '@qovery/shared/ui'

export interface EnableCopilotScreenProps {
  organizationId: string
  onClose: () => void
}

export function EnableCopilotScreen({ organizationId, onClose }: EnableCopilotScreenProps) {
  return (
    <EmptyState
      title="Copilot is disabled"
      description={
        <span className="mx-auto block max-w-[500px]">
          Copilot can help you understand your deployments and infrastructure in read-only mode. An organization
          administrator can enable it in settings after accepting the terms.
        </span>
      }
      icon="robot"
      iconStyle="light"
      className="h-full w-full rounded-none border-none"
    >
      <Link to="/organization/$organizationId/settings/ai-copilot" params={{ organizationId }} onClick={onClose}>
        <Button className="flex" size="md">
          <Icon iconName="sparkles" />
          Enable AI Copilot
        </Button>
      </Link>
    </EmptyState>
  )
}
