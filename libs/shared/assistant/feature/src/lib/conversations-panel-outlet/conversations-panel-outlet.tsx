import { AnimatePresence } from 'framer-motion'
import { useConversationsOpen, useSetConversationsOpen } from '../conversations-context/conversations-context'
import { ConversationsPanel } from '../conversations-panel/conversations-panel'

export function ConversationsPanelOutlet() {
  const conversationsOpen = useConversationsOpen()
  const setConversationsOpen = useSetConversationsOpen()

  return (
    <AnimatePresence>
      {conversationsOpen && <ConversationsPanel onClose={() => setConversationsOpen(false)} />}
    </AnimatePresence>
  )
}

export default ConversationsPanelOutlet
