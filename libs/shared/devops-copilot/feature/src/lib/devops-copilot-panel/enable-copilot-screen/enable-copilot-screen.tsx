import { Button, EmptyState, Icon, Link } from '@qovery/shared/ui'

export interface EnableCopilotScreenProps {
  organizationId: string
  onClose: () => void
}

export function EnableCopilotScreen({ organizationId, onClose }: EnableCopilotScreenProps) {
  return (
    <EmptyState
      title="AI Copilot not activated yet"
      description={
        <span className="mx-auto block max-w-[500px]">
          Our DevOps AI Copilot can help you fix your deployments, optimize your infrastructure costs, audit your
          security and do everything you would expect from a complete DevOps Engineering team. <br />
          Enable it in your organization settings to get started.
        </span>
      }
      icon="robot"
      iconStyle="light"
      className="h-full w-full rounded-none border-none"
    >
      <Link to="/organization/$organizationId/settings/ai-copilot" params={{ organizationId }} onClick={onClose}>
        <Button className="flex gap-2" size="md">
          <Icon iconName="sparkles" />
          Enable AI Copilot
        </Button>
      </Link>
    </EmptyState>
  )
}
