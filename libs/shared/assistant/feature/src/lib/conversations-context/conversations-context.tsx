import posthog from 'posthog-js'
import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type ConversationsActionsContextValue = {
  setConversationsOpen: (open: boolean) => void
  toggleConversationsOpen: () => void
}

const ConversationsOpenContext = createContext(false)
const ConversationsActionsContext = createContext<ConversationsActionsContextValue>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setConversationsOpen: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleConversationsOpen: () => {},
})
const ConversationsUnreadContext = createContext(0)

export function ConversationsProvider({ children }: PropsWithChildren) {
  const [conversationsOpen, setConversationsOpenRaw] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (conversationsOpen) return

    const poll = () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const api = (posthog as any).conversations
        if (typeof api?.getTickets !== 'function') return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        api.getTickets().then((response: any) => {
          const tickets: any[] = Array.isArray(response?.results) ? response.results : []
          // PostHog may use different field names for unread state
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const count = tickets.filter((t: any) =>
            t.unread === true ||
            t.is_unread === true ||
            (typeof t.unread_count === 'number' && t.unread_count > 0) ||
            t.has_unread_messages === true
          ).length
          setUnreadCount(count)
        }).catch(() => undefined)
      } catch {
        // posthog not ready yet
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
