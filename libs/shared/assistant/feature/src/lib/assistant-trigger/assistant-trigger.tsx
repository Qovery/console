import { useEffect } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { useToggleAssistantOpen } from '../assistant-context/assistant-context'

/**
 * Renders only the toggle button. The panel itself is rendered separately via
 * `<AssistantPanelOutlet />` so that it can be positioned next to the sticky navbar
 * (see `apps/console/src/routes/_authenticated/organization/route.tsx`).
 */
export function AssistantTrigger() {
  const { initChat } = useSupportChat()
  const toggleAssistantOpen = useToggleAssistantOpen()

  useEffect(() => {
    // Initialize support chat (either Pylon or Intercom depending on the route:
    // Intercom for onboarding views, Pylon for the rest of the Console).
    initChat()
  }, [initChat])

  return (
    <Button type="button" variant="outline" color="neutral" iconOnly onClick={toggleAssistantOpen}>
      <Icon iconName="circle-question" />
    </Button>
  )
}

export default AssistantTrigger
