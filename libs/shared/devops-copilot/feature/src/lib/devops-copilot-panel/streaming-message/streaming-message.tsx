import { useMemo } from 'react'
import { Icon } from '@qovery/shared/ui'
import { getIconClass, getIconName } from '../../utils/icon-utils/icon-utils'
import type { PlanStep } from '../devops-copilot-panel'

interface StreamingMessageProps {
  displayedStreamingMessage: string
  plan: PlanStep[]
  showPlans: Record<string, boolean>
  setShowPlans: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void
  renderStreamingMessageWithMermaid: (input: string) => JSX.Element[]
}

export function StreamingMessage({
  displayedStreamingMessage,
  plan,
  showPlans,
  setShowPlans,
  renderStreamingMessageWithMermaid,
}: StreamingMessageProps) {
  const tempPlans = plan.filter((p) => p.messageId === 'temp')
  const hasTempPlan = tempPlans.length > 0
  const isTempPlanVisible = showPlans['temp']

  const renderInput = useMemo(() => {
    const input = displayedStreamingMessage

    const hasMermaidBlock = input.includes('```mermaid')

    if (hasMermaidBlock) {
      const completeMermaidBlocks = (input.match(/```merm[\s\S]*?```/g) || []).length

      const totalMermaidStarts = (input.match(/```merm/g) || []).length

      if (totalMermaidStarts > completeMermaidBlocks) {
        const currentMermaidIndex = input.lastIndexOf('```mermaid')
        return input.slice(0, currentMermaidIndex) + 'Generating charts…'
      }
    }

    return input
  }, [displayedStreamingMessage])

  return (
    <div className="streaming text-sm">
      {hasTempPlan && (
        <div
          className="plan-toggle group mt-2 flex cursor-pointer items-center gap-2"
          onClick={() => setShowPlans((prev) => ({ ...prev, temp: !prev['temp'] }))}
        >
          <div className="w-fit text-ssm font-medium italic text-gray-600">Plan steps</div>
          <Icon
            iconName={
              showPlans['temp'] !== undefined && showPlans['temp'] ? 'chevron-circle-up' : 'chevron-circle-down'
            }
            iconStyle="regular"
            className="transform transition-transform group-hover:scale-110"
          />
        </div>
      )}
      {hasTempPlan && showPlans['temp'] !== undefined && isTempPlanVisible && (
        <div className="mt-2 flex flex-col gap-2">
          {tempPlans.map((step, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <Icon iconName={getIconName(step.status)} className={getIconClass(step.status)} />
              <div className="flex flex-col">
                <span className={step.status === 'completed' ? 'text-neutral-400' : ''}>{step.description}</span>
                <span className="text-2xs text-neutral-400">{step.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {renderStreamingMessageWithMermaid(renderInput)}
    </div>
  )
}
