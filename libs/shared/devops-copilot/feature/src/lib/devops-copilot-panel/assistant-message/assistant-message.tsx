import clsx from 'clsx'
import { useThumbSurvey } from 'posthog-js/react/surveys'
import { useMemo } from 'react'
import { Icon } from '@qovery/shared/ui'
import { RenderMarkdown } from '../../devops-render-markdown/devops-render-markdown'
import { getIconClass, getIconName } from '../../utils/icon-utils/icon-utils'
import type { Message, PlanStep } from '../devops-copilot-panel'

const POSTHOG_SURVEY_ID = '019d5352-0c61-0000-467f-5b534e0b5dc7'

interface AssistantMessageProps {
  message: Message
  plan: PlanStep[]
  showPlans: Record<string, boolean>
  setShowPlans: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void
}

function VoteButtons({ messageId }: { messageId: string }) {
  const { respond, response, triggerRef } = useThumbSurvey({
    surveyId: POSTHOG_SURVEY_ID,
    properties: {
      $ai_trace_id: messageId,
    },
  })

  return (
    <div ref={triggerRef} className="invisible mt-2 flex gap-2 text-xs text-neutral-400 group-hover:visible">
      <button
        type="button"
        className={clsx(
          'flex items-center gap-1 rounded border border-neutral-200 px-2 py-1 hover:border-neutral-400',
          { 'text-brand-500': response === 'up' }
        )}
        onClick={() => respond('up')}
      >
        <Icon iconName="thumbs-up" />
      </button>
      <button
        type="button"
        className={clsx(
          'flex items-center gap-1 rounded border border-neutral-200 px-2 py-1 hover:border-neutral-400',
          { 'text-brand-500': response === 'down' }
        )}
        onClick={() => respond('down')}
      >
        <Icon iconName="thumbs-down" />
      </button>
    </div>
  )
}

export function AssistantMessage({ message, plan, showPlans, setShowPlans }: AssistantMessageProps) {
  const messagePlans = plan.filter((p) => p.messageId === message.id)
  const hasPlan = messagePlans.length > 0
  const isPlanVisible = showPlans[message.id]

  const renderedMarkdown = useMemo(() => <RenderMarkdown>{message.text}</RenderMarkdown>, [message.text])

  return (
    <div key={message.id} className="group text-sm">
      {hasPlan && (
        <div
          className="plan-toggle group mt-2 flex cursor-pointer items-center gap-2"
          onClick={() => setShowPlans((prev) => ({ ...prev, [message.id]: !prev[message.id] }))}
        >
          <div className="w-fit text-ssm font-medium italic text-gray-600">Plan steps</div>
          <div className="">
            <Icon
              iconName={isPlanVisible ? 'chevron-circle-up' : 'chevron-circle-down'}
              iconStyle="regular"
              className="transform transition-transform group-hover:scale-110"
            />
          </div>
        </div>
      )}
      {hasPlan && isPlanVisible && (
        <div className="mt-2 flex flex-col gap-2">
          {messagePlans.map((step, index) => (
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
      {renderedMarkdown}
      <VoteButtons messageId={message.id} />
    </div>
  )
}
