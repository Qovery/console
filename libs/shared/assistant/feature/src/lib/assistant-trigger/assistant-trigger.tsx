import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { useAssistantOpen, useSetAssistantOpen, useToggleAssistantOpen } from '../assistant-context/assistant-context'
import { AssistantPanel } from '../assistant-panel/assistant-panel'

export interface AssistantTriggerProps {
  defaultOpen?: boolean
  renderPanel?: boolean
  panelTopOffset?: number
}

export function AssistantTrigger({ defaultOpen = false, renderPanel = true, panelTopOffset }: AssistantTriggerProps) {
  const { initChat } = useSupportChat()
  const assistantOpen = useAssistantOpen()
  const setAssistantOpen = useSetAssistantOpen()
  const toggleAssistantOpen = useToggleAssistantOpen()

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
      {renderPanel && (
        <AnimatePresence>
          {assistantOpen && (
            <AssistantPanel onClose={() => setAssistantOpen(false)} smaller={defaultOpen} topOffset={panelTopOffset} />
          )}
        </AnimatePresence>
      )}
    </>
  )
}

export default AssistantTrigger
