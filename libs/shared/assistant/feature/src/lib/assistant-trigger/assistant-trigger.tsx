import { useState } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { AssistantPanel } from '../assistant-panel/assistant-panel'

export interface AssistantTriggerProps {
  defaultOpen?: boolean
}

export function AssistantTrigger({ defaultOpen = false }: AssistantTriggerProps) {
  const [openAssistant, setOpenAssistant] = useState(defaultOpen)

  return (
    <>
      <Button
        variant="solid"
        color="brand"
        size="lg"
        className="fixed flex justify-center bottom-4 right-4 rounded-full shadow-2xl w-14 h-14"
        onClick={() => setOpenAssistant(!openAssistant)}
      >
        <Icon iconName="question" className="text-lg" />
      </Button>
      {/* XXX: rely on defaultOpen boolean for `smaller` prop as all funnel flows require smaller panel */}
      {openAssistant && <AssistantPanel onClose={() => setOpenAssistant(false)} smaller={defaultOpen} />}
    </>
  )
}

export default AssistantTrigger
