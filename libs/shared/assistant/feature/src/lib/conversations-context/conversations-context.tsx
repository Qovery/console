import posthog from 'posthog-js'
import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type ConversationsActionsContextValue = {
  setConversationsOpen: (open: boolean) => void
  toggleConversationsOpen: () => void
}

const ConversationsOpenContext = createContext(false)
const ConversationsActionsContext = createContext<ConversationsActionsContextValue>({
  setConversationsOpen: (_open: boolean) => undefined,
  toggleConversationsOpen: () => undefined,
})
const ConversationsUnreadContext = createContext(0)

export function ConversationsProvider({ children }: PropsWithChildren) {
  const [conversationsOpen, setConversationsOpenRaw] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (conversationsOpen) return

    const poll = () => {
      try {
        type TicketLike = { unread?: boolean; is_unread?: boolean; unread_count?: number; has_unread_messages?: boolean }
        type ConversationsApi = { getTickets?: () => Promise<{ results?: TicketLike[] }> }
        const api = (posthog as unknown as { conversations?: ConversationsApi }).conversations
        if (typeof api?.getTickets !== 'function') return
        api.getTickets().then((response) => {
          const tickets: TicketLike[] = Array.isArray(response?.results) ? response.results : []
          const count = tickets.filter((t) =>
            t.unread === true ||
            t.is_unread === true ||
            (typeof t.unread_count === 'number' && t.unread_count > 0) ||
            t.has_unread_messages === true
          ).length
          setUnreadCount(count)
        }).catch(() => undefined)
      } catch {
        return
      }
    }

    const timeout = setTimeout(poll, 2_000)
    const interval = setInterval(poll, 15_000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [conversationsOpen])

  const setConversationsOpen = useCallback((open: boolean) => {
    if (open) setUnreadCount(0)
    setConversationsOpenRaw(open)
  }, [])

  const toggleConversationsOpen = useCallback(() => {
    setConversationsOpenRaw((prev) => {
      if (!prev) setUnreadCount(0)
      return !prev
    })
  }, [])

  const actionsValue = useMemo(
    () => ({ setConversationsOpen, toggleConversationsOpen }),
    [setConversationsOpen, toggleConversationsOpen]
  )

  return (
    <ConversationsActionsContext.Provider value={actionsValue}>
      <ConversationsOpenContext.Provider value={conversationsOpen}>
        <ConversationsUnreadContext.Provider value={unreadCount}>
          {children}
        </ConversationsUnreadContext.Provider>
      </ConversationsOpenContext.Provider>
    </ConversationsActionsContext.Provider>
  )
}

export function useConversationsOpen() {
  return useContext(ConversationsOpenContext)
}

export function useSetConversationsOpen() {
  return useContext(ConversationsActionsContext).setConversationsOpen
}

export function useConversationsUnreadCount() {
  return useContext(ConversationsUnreadContext)
}
