import { useContext } from 'react'
import { useState } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { AssistantContext } from '../assistant-context/assistant-context'
import { AssistantPanel } from '../assistant-panel/assistant-panel'

export interface AssistantTriggerProps {
  defaultOpen?: boolean
}

export function AssistantTrigger({ defaultOpen = false }: AssistantTriggerProps) {
  const { assistantOpen, setAssistantOpen } = useContext(AssistantContext)

  return (
    <>
      <button
        className="group overflow-hidden fixed flex items-center justify-center bottom-8 right-8 rounded-full shadow-2xl w-14 h-14 outline-brand-600 bg-brand-500 hover:bg-brand-600 hover:animate-[showAssistantTrigger_0.2s_cubic-bezier(0.21,1.02,0.73,1)_forwards] transition text-neutral-50"
        onClick={() => setAssistantOpen(!assistantOpen)}
      >
        <Icon
          iconStyle="light"
          iconName="question"
          className="text-2xl group-hover:animate-[shake_0.6s_cubic-bezier(0.36,0.07,0.19,0.97)_both]"
        />
        <span className="group-hover:opacity-20 group-hover:animate-[shineAssistantTrigger_1s_linear_forwards] pointer-events-none opacity-0 absolute left-0 top-0 w-[150px] h-[150px] bg-gradient-to-b from-transparent from-0% via-neutral-50 via-50% to-transparent to-100%"></span>
      </button>
      {/* XXX: rely on defaultOpen boolean for `smaller` prop as all funnel flows require smaller panel */}
      {assistantOpen && <AssistantPanel onClose={() => setAssistantOpen(false)} smaller={defaultOpen} />}
    </>
  )
}

export default AssistantTrigger
