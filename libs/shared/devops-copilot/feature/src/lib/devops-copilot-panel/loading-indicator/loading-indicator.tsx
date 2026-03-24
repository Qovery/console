import clsx from 'clsx'
import { AnimatedGradientText, Icon } from '@qovery/shared/ui'
import { getIconClass, getIconName } from '../../utils/icon-utils/icon-utils'
import { type PlanStep } from '../devops-copilot-panel'

export interface LoadingIndicatorProps {
  loadingText: string
  plan: PlanStep[]
  showPlans: Record<string, boolean>
  onTogglePlans: (messageId: string) => void
}

export function LoadingIndicator({ loadingText, plan, showPlans, onTogglePlans }: LoadingIndicatorProps) {
  const tempPlanSteps = plan.filter((p) => p.messageId === 'temp')

  return (
    <div className="relative top-2 mt-auto">
      <div className="group flex cursor-pointer items-center gap-2" onClick={() => onTogglePlans('temp')}>
        <AnimatedGradientText className="w-fit text-ssm font-medium">{loadingText}</AnimatedGradientText>
        {tempPlanSteps.length > 0 && (
          <Icon
            iconName={showPlans['temp'] ? 'chevron-circle-up' : 'chevron-circle-down'}
            iconStyle="regular"
            className="transform transition-transform group-hover:scale-110"
          />
        )}
      </div>
      {showPlans['temp'] && tempPlanSteps.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {tempPlanSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <Icon iconName={getIconName(step.status)} className={getIconClass(step.status)} />
              <div className="flex flex-col">
                <span className={clsx({ 'text-neutral-400': step.status === 'completed' })}>{step.description}</span>
                <span className="text-2xs text-neutral-400">{step.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
