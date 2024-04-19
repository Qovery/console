import { useContext } from 'react'
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
      <Button
        variant="solid"
        color="brand"
        size="lg"
        className="fixed flex justify-center bottom-8 right-8 rounded-full shadow-2xl w-14 h-14 overflow-hidden before:content-[''] before:absolute before:w-[200px] before:h-full before:bg-[linear-gradient(_45deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.8),rgba(255,255,255,0)_70%_)] before:-left-10 before:top-0 before:animate-[shine_2s_infinite_linear]"
        onClick={() => setAssistantOpen(!assistantOpen)}
      >
        <Icon iconName="question" className="text-2xl" />
      </Button>
      {/* XXX: rely on defaultOpen boolean for `smaller` prop as all funnel flows require smaller panel */}
      {assistantOpen && <AssistantPanel onClose={() => setAssistantOpen(false)} smaller={defaultOpen} />}
    </>
  )
}

export default AssistantTrigger
