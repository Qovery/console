import { clsx } from 'clsx'
import { useContext } from 'react'
import { match } from 'ts-pattern'
import { Icon } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import { AssistantContext } from '../assistant-context/assistant-context'
import { type AssistantIcon, AssistantIconKey } from '../assistant-icon/assistant-icon'
import { AssistantPanel } from '../assistant-panel/assistant-panel'

export interface AssistantTriggerProps {
  defaultOpen?: boolean
}

export function AssistantTrigger({ defaultOpen = false }: AssistantTriggerProps) {
  const { assistantOpen, setAssistantOpen } = useContext(AssistantContext)
  const [assistantIcon] = useLocalStorage<AssistantIcon>(AssistantIconKey, 'QUESTION_MARK')

  return (
    <>
      <button
        className={clsx(
          'group fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-neutral-50 outline-brand-600 transition hover:animate-[showAssistantTrigger_0.2s_cubic-bezier(0.21,1.02,0.73,1)_forwards]',
          assistantIcon === 'QUESTION_MARK' && 'bg-brand-500 shadow-2xl hover:bg-brand-600',
          assistantIcon === 'PAPERCLIP' && 'drop-shadow-2xl'
        )}
        onClick={() => setAssistantOpen(!assistantOpen)}
      >
        {match(assistantIcon)
          .with('QUESTION_MARK', () => (
            <Icon
              iconStyle="regular"
              iconName="question"
              className="text-2xl group-hover:animate-[shake_0.6s_cubic-bezier(0.36,0.07,0.19,0.97)_both]"
            />
          ))
          .with('PAPERCLIP', () => (
            <img
              src="/assets/images/paperclip_emoji.png"
              alt="assistant-button"
              className="group-hover:animate-[shake_0.6s_cubic-bezier(0.36,0.07,0.19,0.97)_both]"
            />
          ))
          .exhaustive()}
        <span className="pointer-events-none absolute left-0 top-0 h-[150px] w-[150px] bg-gradient-to-b from-transparent from-0% via-neutral-50 via-50% to-transparent to-100% opacity-0 group-hover:animate-[shineAssistantTrigger_1s_linear_forwards] group-hover:opacity-20"></span>
      </button>

      {/* XXX: rely on defaultOpen boolean for `smaller` prop as all funnel flows require smaller panel */}
      {assistantOpen && <AssistantPanel onClose={() => setAssistantOpen(false)} smaller={defaultOpen} />}
    </>
  )
}

export default AssistantTrigger
