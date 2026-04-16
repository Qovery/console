import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { AssistantPanel } from '../assistant-panel/assistant-panel'
import { setAssistantOpen, toggleAssistantOpen, useAssistantOpen } from '../assistant-store/assistant-store'

export interface AssistantTriggerProps {
  defaultOpen?: boolean
  compactTopOffset?: boolean
}

export function AssistantTrigger({ defaultOpen = false, compactTopOffset = false }: AssistantTriggerProps) {
  const { initChat } = useSupportChat()
  const assistantOpen = useAssistantOpen()

  useEffect(() => {
    // Initialize support chat (either Pylon or Intercom depending on the route: Intercom for onboarding views, Pylon for the rest of the Console)
    initChat()
  }, [initChat])

  return (
    <>
      <Button type="button" variant="outline" color="neutral" iconOnly onClick={toggleAssistantOpen}>
        <Icon iconName="circle-question" />
      </Button>

      {/* XXX: rely on defaultOpen boolean for `smaller` prop as all funnel flows require smaller panel */}
      <AnimatePresence>
        {assistantOpen && (
          <AssistantPanel
            onClose={() => setAssistantOpen(false)}
            smaller={defaultOpen}
            compactTopOffset={compactTopOffset}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default AssistantTrigger
