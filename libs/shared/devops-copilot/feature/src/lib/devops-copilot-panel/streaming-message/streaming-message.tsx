import { Icon } from '@qovery/shared/ui'
import { getIconClass, getIconName } from '../../utils/icon-utils/icon-utils'
import type { PlanStep } from '../devops-copilot-panel.types'

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

  const input = displayedStreamingMessage
  let renderInput = input

  const allBackticks = [...input.matchAll(/```/g)]
  if (allBackticks.length > 0) {
    const lastBacktick = allBackticks.at(-1)
    if (lastBacktick && lastBacktick.index !== undefined) {
      const afterBackticks = input.slice(lastBacktick.index + 3)
      if (!afterBackticks.includes('\n') && afterBackticks.length < 10) {
        if ('mermaid'.startsWith(afterBackticks.trim()) && afterBackticks.trim().length > 0) {
          renderInput = input.slice(0, lastBacktick.index) + 'Generating charts…'
        } else if (afterBackticks.trim().length === 0 || afterBackticks.match(/^[a-z]*$/)) {
          renderInput = input.slice(0, lastBacktick.index)
        }
      }
    }
  }

  const startMatches = [...renderInput.matchAll(/```mermaid/g)]
  const endMatches = [...renderInput.matchAll(/```(?!mermaid)/g)]
  if (startMatches.length > endMatches.length) {
    const lastStart = startMatches.at(-1)
    if (lastStart) {
      const cutoffIndex = lastStart.index ?? renderInput.length
      renderInput = renderInput.slice(0, cutoffIndex) + 'Generating charts…'
    }
  }

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
