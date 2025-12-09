import clsx from 'clsx'
import { type MutableRefObject } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { RenderMarkdown } from '../../devops-render-markdown/devops-render-markdown'
import { getIconClass, getIconName } from '../../utils/icon-utils/icon-utils'
import type { Message, PlanStep } from '../devops-copilot-panel'

interface AssistantMessageProps {
  message: Message
  plan: PlanStep[]
  showPlans: Record<string, boolean>
  setShowPlans: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void
  mermaidRenderCache: MutableRefObject<Map<string, JSX.Element>>
  handleVote: (messageId: string, vote: 'upvote' | 'downvote') => void
}

export function AssistantMessage({
  message,
  plan,
  showPlans,
  setShowPlans,
  mermaidRenderCache,
  handleVote,
}: AssistantMessageProps) {
  const messagePlans = plan.filter((p) => p.messageId === message.id)
  const hasPlan = messagePlans.length > 0
  const isPlanVisible = showPlans[message.id]

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
      {(() => {
        if (!mermaidRenderCache.current.has(message.id)) {
          mermaidRenderCache.current.set(message.id, <RenderMarkdown>{message.text}</RenderMarkdown>)
        }
        return mermaidRenderCache.current.get(message.id)
      })()}{' '}
      <div className="invisible mt-2 flex gap-2 text-xs text-neutral-400 group-hover:visible">
        <Button
          type="button"
          variant="surface"
          className={clsx('flex items-center gap-1 px-2 py-1', {
            'text-brand-500': message.vote === 'upvote',
          })}
          onClick={() => handleVote(message.id, 'upvote')}
        >
          <Icon iconName="thumbs-up" />
        </Button>
        <Button
          type="button"
          variant="surface"
          className={clsx('flex items-center gap-1 px-2 py-1', {
            'text-brand-500': message.vote === 'downvote',
          })}
          onClick={() => handleVote(message.id, 'downvote')}
        >
          <Icon iconName="thumbs-down" />
        </Button>
      </div>
    </div>
  )
}
