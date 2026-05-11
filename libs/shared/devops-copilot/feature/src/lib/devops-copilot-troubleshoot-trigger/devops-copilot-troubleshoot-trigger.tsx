import posthog from 'posthog-js'
import { useContext } from 'react'
import { Button, Icon, Tooltip } from '@qovery/shared/ui'
import { DevopsCopilotContext } from '../devops-copilot-context/devops-copilot-context'

export interface DevopsCopilotTroubleshootTriggerProps {
  message: string
  source: string
  deploymentId?: string
}

export function DevopsCopilotTroubleshootTrigger({
  deploymentId,
  message,
  source,
}: DevopsCopilotTroubleshootTriggerProps) {
  const { setDevopsCopilotOpen, sendMessageRef } = useContext(DevopsCopilotContext)

  const openTroubleshoot = () => {
    posthog.capture('ai-copilot-troubleshoot-triggered', {
      source,
      deployment_id: deploymentId,
    })

    setDevopsCopilotOpen(true)
    sendMessageRef?.current?.(message)
  }

  return (
    <Tooltip
      classNameContent="group rounded-full cursor-pointer pl-3 pr-1.5"
      side="bottom"
      content={
        <div className="flex items-center gap-1.5" onClick={openTroubleshoot}>
          <Icon iconName="sparkles" iconStyle="solid" className="text-brand" />
          <span className="text-ssm">Ask for diagnostic</span>
          <Button
            size="xs"
            variant="surface"
            iconOnly
            radius="full"
            className="ml-0.5 group-hover:bg-surface-neutral-componentHover"
          >
            <Icon iconName="arrow-right" />
          </Button>
        </div>
      }
    >
      <div onClick={openTroubleshoot} className="group cursor-pointer">
        <Icon
          iconName="sparkles"
          iconStyle="solid"
          className="text-neutral-subtle transition-colors group-hover:text-brand"
        />
      </div>
    </Tooltip>
  )
}
