import { useAuth0 } from '@auth0/auth0-react'
import { motion, useReducedMotion } from 'framer-motion'
import posthog from 'posthog-js'
import { useEffect, useRef, useState } from 'react'
import { Badge, Button, Icon, LoaderSpinner, Skeleton } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'

type View = 'list' | 'compose' | 'thread'
type SendState = 'idle' | 'sending' | 'error'
type LoadState = 'idle' | 'loading' | 'error'

type TicketStatus = 'new' | 'open' | 'pending' | 'on_hold' | 'resolved'
type MessageAuthorType = 'customer' | 'AI' | 'human'

interface Ticket {
  id: string
  status: TicketStatus
  last_message?: string
  last_message_at?: string
  message_count: number
  created_at: string
  unread_count?: number
}

interface Message {
  id: string
  content: string
  author_type: MessageAuthorType
  author_name?: string
  created_at: string
  is_private: boolean
}

// Derive a stable UUID from distinct_id so each authenticated user gets their
// own widget session — prevents cross-user ticket leakage on shared devices.
// The SDK caches widget_session_id in memory after first load so we can't
// override it; direct HTTP calls with explicit distinct_id are the only
// reliable way to filter tickets per user.
function distinctIdToUUID(id: string): string {
  let h1 = 5381,
    h2 = 52711
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i)
    h1 = (Math.imul(h1, 33) + c) >>> 0
    h2 = (Math.imul(h2, 33) ^ c) >>> 0
  }
  let h3 = Math.imul(h1 ^ (h1 >>> 16), 0x45d9f3b) >>> 0
  let h4 = Math.imul(h2 ^ (h2 >>> 16), 0x45d9f3b) >>> 0
  h3 = Math.imul(h3 ^ (h3 >>> 16), 0x45d9f3b) >>> 0
  h4 = Math.imul(h4 ^ (h4 >>> 16), 0x45d9f3b) >>> 0
  const p = (n: number) => n.toString(16).padStart(8, '0')
  const raw = p(h1) + p(h2) + p(h3) + p(h4)
  const ver = '4' + raw.slice(13, 16)
  const variant =
    ((parseInt(raw.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + raw.slice(18, 20)
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${ver}-${variant}-${raw.slice(20, 32)}`
}

// sub comes from Auth0's user.sub — always synchronous and up-to-date,
// unlike posthog.get_distinct_id() which may lag behind posthog.identify().
function getApiConfig(sub: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ph = posthog as any
  const apiHost = (ph.config?.api_host ?? 'https://us.posthog.com').replace(/\/$/, '')
  const phcToken = ph.config?.token ?? ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conversationsToken = (window as any)._POSTHOG_REMOTE_CONFIG?.[phcToken]?.config?.conversations?.token ?? ''
  const widgetSessionId = distinctIdToUUID(sub)
  return { apiHost, conversationsToken, distinctId: sub, widgetSessionId }
}

async function apiGetTickets(sub: string): Promise<Ticket[]> {
  const { apiHost, conversationsToken, distinctId, widgetSessionId } = getApiConfig(sub)
  const params = new URLSearchParams({ widget_session_id: widgetSessionId, distinct_id: distinctId, limit: '20', offset: '0' })
  const res = await fetch(`${apiHost}/api/conversations/v1/widget/tickets?${params}`, {
    headers: { 'X-Conversations-Token': conversationsToken },
  })
  if (!res.ok) throw new Error(`getTickets failed: ${res.status}`)
  const data = await res.json()
  return Array.isArray(data?.results) ? (data.results as Ticket[]) : []
}

async function apiGetMessages(ticketId: string, sub: string): Promise<Message[]> {
  const { apiHost, conversationsToken, widgetSessionId } = getApiConfig(sub)
  const params = new URLSearchParams({ widget_session_id: widgetSessionId, limit: '50' })
  const res = await fetch(`${apiHost}/api/conversations/v1/widget/messages/${ticketId}?${params}`, {
    headers: { 'X-Conversations-Token': conversationsToken },
  })
  if (!res.ok) throw new Error(`getMessages failed: ${res.status}`)
  const data = await res.json()
  const messages: Message[] = Array.isArray(data?.messages) ? data.messages : []
  return messages.filter((m) => !m.is_private)
}

async function apiSendMessage(
  message: string,
  ticketId: string | null,
  sub: string
): Promise<{ ticket_id: string; message_id: string; created_at: string }> {
  const { apiHost, conversationsToken, distinctId, widgetSessionId } = getApiConfig(sub)
  const res = await fetch(`${apiHost}/api/conversations/v1/widget/message`, {
    method: 'POST',
    headers: { 'X-Conversations-Token': conversationsToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      widget_session_id: widgetSessionId,
      distinct_id: distinctId,
      message,
      ticket_id: ticketId,
    }),
  })
  if (!res.ok) throw new Error(`sendMessage failed: ${res.status}`)
  return res.json()
}

async function apiMarkAsRead(ticketId: string, sub: string): Promise<void> {
  const { apiHost, conversationsToken, widgetSessionId } = getApiConfig(sub)
  await fetch(`${apiHost}/api/conversations/v1/widget/messages/${ticketId}/read`, {
    method: 'POST',
    headers: { 'X-Conversations-Token': conversationsToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({ widget_session_id: widgetSessionId }),
  })
}

function getTicketTitle(ticket: Ticket, previews: Record<string, string>): string {
  return ticket.last_message?.trim() || previews[ticket.id] || ''
}

function isTicketUnread(ticket: Ticket): boolean {
  return typeof ticket.unread_count === 'number' && ticket.unread_count > 0
}

function isTicketActive(ticket: Ticket): boolean {
  return ticket.status !== 'resolved'
}

function MessageContent({ body, isUser }: { body: string; isUser: boolean }) {
  const parts = body.split(/(!\[[^\]]*\]\(https?:\/\/[^)]+\))/g)
  if (parts.length === 1) {
    return <p className="whitespace-pre-wrap break-words">{body}</p>
  }
  return (
    <>
      {parts.map((part, i) => {
        const imgMatch = part.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/)
        if (imgMatch) {
          const [, alt, url] = imgMatch
          return (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="mt-1 block">
              <img
                src={url}
                alt={alt || 'image'}
                className={`max-w-full rounded-md border ${isUser ? 'border-neutralInvert/20' : 'border-neutral'}`}
              />
            </a>
          )
        }
        const text = part.trim()
        return text ? (
          <p key={i} className="whitespace-pre-wrap break-words">
            {text}
          </p>
        ) : null
      })}
    </>
  )
}

export interface ConversationsPanelProps {
  onClose: () => void
}

export function ConversationsPanel({ onClose }: ConversationsPanelProps) {
  const { user } = useAuth0()
  const [view, setView] = useState<View>('list')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [message, setMessage] = useState('')
  const [sendState, setSendState] = useState<SendState>('idle')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [threadMessages, setThreadMessages] = useState<Message[]>([])
  const [threadLoadState, setThreadLoadState] = useState<LoadState>('idle')
  const [composeSent, setComposeSent] = useState(false)
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onClose])

  // Reload tickets whenever the authenticated user changes.
  useEffect(() => {
    if (!user?.sub) return
    const sub = user.sub
    setLoadState('loading')
    setTickets([])
    setPreviews({})

    async function init() {
      const results = await apiGetTickets(sub)
      setTickets(results)
      setView(results.length === 0 ? 'compose' : 'list')
      setLoadState('idle')

      const needPreview = results.filter((t) => !getTicketTitle(t, {}))
      if (needPreview.length === 0) return

      const updates: Record<string, string> = {}
      await Promise.all(
        needPreview.map(async (ticket) => {
          try {
            const msgs = await apiGetMessages(ticket.id, sub)
            const first = msgs.find((m) => m.author_type === 'customer') ?? msgs[0]
            if (first?.content) updates[ticket.id] = first.content.slice(0, 80)
          } catch {
            return
          }
        })
      )

      if (Object.keys(updates).length > 0) setPreviews(updates)
    }

    init().catch(() => {
      setLoadState('error')
      setView('compose')
    })
  }, [user?.sub])

  // Poll for new messages every 5s while a thread is open.
  useEffect(() => {
    if (view !== 'thread' || !selectedTicket || !user?.sub) return
    const sub = user.sub

    const interval = setInterval(async () => {
      const msgs = await apiGetMessages(selectedTicket.id, sub)
      setThreadMessages(msgs)
    }, 5_000)

    return () => clearInterval(interval)
  }, [view, selectedTicket, user?.sub])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  const loadMessages = async (ticket: Ticket) => {
    if (!user?.sub) return
    setSelectedTicket(ticket)
    setView('thread')
    setThreadLoadState('loading')
    setThreadMessages([])
    try {
      apiMarkAsRead(ticket.id, user.sub).catch(() => undefined)
      const msgs = await apiGetMessages(ticket.id, user.sub)
      setThreadMessages(msgs)
      setThreadLoadState('idle')
    } catch {
      setThreadLoadState('error')
    }
  }

  const handleSendNew = async () => {
    if (!message.trim() || !user?.sub) return
    const sub = user.sub
    setSendState('sending')
    try {
      const response = await apiSendMessage(message.trim(), null, sub)
      setPreviews((prev) => ({ ...prev, [response.ticket_id]: message.trim().slice(0, 80) }))
      setMessage('')
      setComposeSent(true)
      setSendState('idle')
      apiGetTickets(sub)
        .then((results) => setTickets(results))
        .catch(() => undefined)
    } catch {
      setSendState('error')
    }
  }

  const handleSendReply = async () => {
    if (!message.trim() || !selectedTicket || !user?.sub) return
    const sub = user.sub

    // Optimistic update so the message appears instantly in the UI.
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      content: message.trim(),
      author_type: 'customer',
      created_at: new Date().toISOString(),
      is_private: false,
    }
    setThreadMessages((prev) => [...prev, optimistic])
    setMessage('')
    setSendState('sending')

    try {
      const response = await apiSendMessage(optimistic.content, selectedTicket.id, sub)
      setThreadMessages((prev) =>
        prev.map((m) =>
          m.id === optimistic.id ? { ...optimistic, id: response.message_id, created_at: response.created_at } : m
        )
      )
      setSendState('idle')
    } catch {
      setThreadMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setMessage(optimistic.content)
      setSendState('error')
    }
  }

  const handleBackToList = () => {
    setSendState('idle')
    setMessage('')
    setComposeSent(false)
    setSelectedTicket(null)
    setThreadMessages([])
    setView('list')
  }

  const handleNewMessage = () => {
    setSendState('idle')
    setMessage('')
    setComposeSent(false)
    setView('compose')
  }

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : {
        x: { type: 'spring' as const, stiffness: 900, damping: 45, mass: 0.5 },
        opacity: { duration: 0.12 },
      }

  const headerTitle =
    view === 'compose'
      ? 'New message'
      : view === 'thread'
        ? getTicketTitle(selectedTicket!, previews) || 'Conversation'
        : 'Feedback'

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { x: 32, opacity: 0 }}
      transition={transition}
      style={{ backfaceVisibility: 'hidden' }}
      className="flex h-full w-[368px] flex-col overflow-hidden border-l border-neutral bg-background shadow-sm will-change-transform"
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          {(view === 'compose' && tickets.length > 0) || view === 'thread' ? (
            <button
              type="button"
              aria-label="Back to conversations"
              onClick={handleBackToList}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-neutral-subtle transition duration-150 hover:bg-surface-neutral-component hover:text-neutral"
            >
              <Icon iconName="arrow-left" className="text-xs" />
            </button>
          ) : null}
          <div className="flex min-w-0 items-center gap-2 font-medium text-neutral">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-brand-solid text-sm text-neutralInvert">
              <Icon iconName="comment-lines" />
            </span>
            <span className="truncate text-sm">{headerTitle}</span>
          </div>
        </div>
        <button type="button" aria-label="Close feedback panel" onClick={onClose} className="shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-neutral-subtle text-neutral-subtle duration-300 ease-out hover:bg-surface-brand-component hover:text-brand">
            <Icon iconName="xmark" />
          </span>
        </button>
      </div>

      {view === 'list' && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {loadState === 'loading' && (
              <div className="flex flex-col divide-y divide-neutral">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-col gap-2 px-5 py-4">
                    <Skeleton height={14} width="60%" />
                    <Skeleton height={12} width="40%" />
                  </div>
                ))}
              </div>
            )}
            {loadState === 'idle' && tickets.length > 0 && (
              <ul className="divide-y divide-neutral">
                {tickets.map((ticket) => {
                  const title = getTicketTitle(ticket, previews)
                  const active = isTicketActive(ticket)
                  return (
                    <li key={ticket.id}>
                      <button
                        type="button"
                        className="flex w-full flex-col gap-1 px-5 py-4 text-left transition duration-150 hover:bg-surface-neutral-subtle"
                        onClick={() => loadMessages(ticket)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-neutral">
                            {title || <span className="italic text-neutral-subtle">Conversation</span>}
                          </span>
                          {isTicketUnread(ticket) && (
                            <Badge color="brand" variant="surface" size="sm" radius="full" className="shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-subtle">{timeAgo(new Date(ticket.created_at))} ago</span>
                          <span aria-hidden="true" className="text-neutral-subtle">
                            ·
                          </span>
                          <Badge color={active ? 'green' : 'neutral'} variant="surface" size="sm" radius="rounded">
                            {active ? 'Open' : 'Closed'}
                          </Badge>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <div className="border-t border-neutral p-4">
            <Button
              type="button"
              variant="surface"
              color="neutral"
              size="md"
              className="w-full justify-center"
              onClick={handleNewMessage}
            >
              <Icon iconName="pen-to-square" className="mr-1.5" />
              New message
            </Button>
          </div>
        </div>
      )}

      {view === 'thread' && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {threadLoadState === 'loading' && (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <Skeleton height={52} width="70%" />
                  </div>
                ))}
              </div>
            )}
            {threadLoadState === 'error' && <p className="text-sm text-negative">Failed to load messages.</p>}
            {threadLoadState === 'idle' && threadMessages.length === 0 && (
              <p className="py-8 text-center text-sm text-neutral-subtle">No messages yet.</p>
            )}
            {threadLoadState === 'idle' && threadMessages.length > 0 && (
              <div className="flex flex-col gap-3">
                {threadMessages.map((msg) => {
                  const fromUser = msg.author_type === 'customer'
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 ${fromUser ? 'items-end' : 'items-start'}`}>
                      {!fromUser && (
                        <span className="px-1 text-xs font-medium text-neutral-subtle">
                          {msg.author_name ?? 'Support'}
                        </span>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          fromUser ? 'bg-surface-brand-solid text-neutralInvert' : 'bg-surface-neutral-subtle text-neutral'
                        }`}
                      >
                        <MessageContent body={msg.content} isUser={fromUser} />
                        <p className={`mt-1 text-xs ${fromUser ? 'text-neutralInvert/70' : 'text-neutral-subtle'}`}>
                          {timeAgo(new Date(msg.created_at))} ago
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="border-t border-neutral p-4">
            <div className="flex flex-col gap-2">
              <textarea
                className="min-h-[80px] resize-none rounded-lg border border-neutral bg-background p-3 text-sm text-neutral placeholder:text-neutral-subtle focus:border-brand-component focus:outline-none focus:ring-1 focus:ring-brand-component disabled:opacity-50"
                placeholder="Reply…"
                value={message}
                disabled={sendState === 'sending'}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendReply()
                }}
              />
              {sendState === 'error' && (
                <p className="text-sm text-negative">Something went wrong. Please try again.</p>
              )}
              <div className="flex items-center justify-end gap-3">
                <p className="text-xs text-neutral-subtle">⌘↵ to send</p>
                <Button
                  type="button"
                  size="md"
                  disabled={!message.trim() || sendState === 'sending'}
                  onClick={handleSendReply}
                >
                  {sendState === 'sending' ? <LoaderSpinner className="w-4" /> : 'Send reply'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'compose' && (
        <div className="flex flex-1 flex-col gap-4 p-5">
          {composeSent ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-positive-component text-positive">
                <Icon iconName="check" className="text-xl" />
              </span>
              <div>
                <p className="font-medium text-neutral">Message sent</p>
                <p className="mt-1 text-sm text-neutral-subtle">We'll get back to you as soon as possible.</p>
              </div>
              <button type="button" className="text-sm text-brand hover:underline" onClick={handleNewMessage}>
                Send another message
              </button>
              {tickets.length > 0 && (
                <button
                  type="button"
                  className="text-sm text-neutral-subtle hover:text-neutral hover:underline"
                  onClick={handleBackToList}
                >
                  View all conversations
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-subtle">How can we help? Share your feedback or describe an issue.</p>
              <textarea
                className="min-h-[120px] flex-1 resize-none rounded-lg border border-neutral bg-background p-3 text-sm text-neutral placeholder:text-neutral-subtle focus:border-brand-component focus:outline-none focus:ring-1 focus:ring-brand-component disabled:opacity-50"
                placeholder="Describe your issue or share feedback…"
                value={message}
                disabled={sendState === 'sending'}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendNew()
                }}
              />
              {sendState === 'error' && (
                <p className="text-sm text-negative">Something went wrong. Please try again.</p>
              )}
              <div className="flex items-center justify-end gap-3">
                <p className="text-xs text-neutral-subtle">⌘↵ to send</p>
                <Button
                  type="button"
                  size="lg"
                  disabled={!message.trim() || sendState === 'sending'}
                  onClick={handleSendNew}
                >
                  {sendState === 'sending' ? <LoaderSpinner className="w-4" /> : 'Send message'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default ConversationsPanel
