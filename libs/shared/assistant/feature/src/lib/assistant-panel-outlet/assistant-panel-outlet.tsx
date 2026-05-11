import { AnimatePresence } from 'framer-motion'
import { useAssistantOpen, useSetAssistantOpen } from '../assistant-context/assistant-context'
import { AssistantPanel } from '../assistant-panel/assistant-panel'

/**
 * Renders the assistant panel at the location where it is mounted, driven by the
 * shared AssistantProvider state. The caller is responsible for wrapping this in the
 * correct sticky container right after the sticky navbar.
 */
export function AssistantPanelOutlet() {
  const assistantOpen = useAssistantOpen()
  const setAssistantOpen = useSetAssistantOpen()

  return (
    <AnimatePresence>{assistantOpen && <AssistantPanel onClose={() => setAssistantOpen(false)} />}</AnimatePresence>
  )
}

export default AssistantPanelOutlet
