import { SETTINGS_AI_COPILOT_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Button, Icon, Link } from '@qovery/shared/ui'

export interface EnableCopilotScreenProps {
  organizationId?: string
  onClose: () => void
}

export function EnableCopilotScreen({ organizationId, onClose }: EnableCopilotScreenProps) {
  return (
    <div className="flex grow flex-col items-center justify-center gap-4 bg-neutral-100 p-8">
      <div className="relative flex h-10 w-10 items-center justify-center bg-neutral-150">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          fill="none"
          viewBox="0 0 40 40"
          className="absolute inset-0"
        >
          <path fill="#67778e" d="M4 0v1H1v3H0V0zM36 0v1h3v3h1V0zM4 40v-1H1v-3H0v4zM36 40v-1h3v-3h1v4z"></path>
        </svg>
        <Icon iconName="robot" iconStyle="light" className="relative z-10 text-neutral-350" />
      </div>
      <div className="flex max-w-md flex-col gap-1 text-center">
        <span className="text-sm font-medium text-neutral-400">AI Copilot not activated yet</span>
        <span className="text-sm text-neutral-400">
          Our DevOps AI Copilot can help you fix your deployments, optimize your infrastructure costs, audit your
          security and do everything you would expect from a complete DevOps Engineering team. Enable it in your
          organization settings to get started.
        </span>
      </div>

      <Link to={`${SETTINGS_URL(organizationId)}${SETTINGS_AI_COPILOT_URL}`} onClick={onClose}>
        <Button className="flex gap-2" size="md">
          <Icon iconName="sparkles" />
          Enable AI Copilot
        </Button>
      </Link>
    </div>
  )
}
