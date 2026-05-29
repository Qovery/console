import { useAuth0 } from '@auth0/auth0-react'
import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiGetTickets } from '../conversations-api'

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
  const { user } = useAuth0()
  const [conversationsOpen, setConversationsOpenRaw] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (conversationsOpen || !user?.sub) return
    const sub = user.sub

    const poll = () => {
      apiGetTickets(sub)
        .then((tickets) => {
          const count = tickets.filter((t) => typeof t.unread_count === 'number' && t.unread_count > 0).length
          setUnreadCount(count)
        })
        .catch(() => undefined)
    }

    const timeout = setTimeout(poll, 2_000)
    const interval = setInterval(poll, 30_000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [conversationsOpen, user?.sub])

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
