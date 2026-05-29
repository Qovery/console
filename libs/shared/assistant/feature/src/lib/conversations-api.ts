import posthog from 'posthog-js'

export interface Ticket {
  id: string
  status: 'new' | 'open' | 'pending' | 'on_hold' | 'resolved'
  last_message?: string
  last_message_at?: string
  message_count: number
  created_at: string
  unread_count?: number
}

export interface Message {
  id: string
  content: string
  author_type: 'customer' | 'AI' | 'human'
  author_name?: string
  created_at: string
  is_private: boolean
}

export function getApiConfig(sub: string) {
  const ph = posthog as unknown as { config?: { api_host?: string; token?: string } }
  const apiHost = (ph.config?.api_host ?? 'https://us.posthog.com').replace(/\/$/, '')
  const phcToken = ph.config?.token ?? ''
  const remoteConfig = (
    window as unknown as {
      _POSTHOG_REMOTE_CONFIG?: Record<string, { config?: { conversations?: { token?: string } } }>
    }
  )._POSTHOG_REMOTE_CONFIG
  const conversationsToken = remoteConfig?.[phcToken]?.config?.conversations?.token ?? ''
  const widgetSessionId = posthog.get_session_id()
  return { apiHost, conversationsToken, distinctId: sub, widgetSessionId }
}

export async function apiGetTickets(sub: string): Promise<Ticket[]> {
  const { apiHost, conversationsToken, distinctId, widgetSessionId } = getApiConfig(sub)
  const params = new URLSearchParams({ widget_session_id: widgetSessionId, distinct_id: distinctId, limit: '20', offset: '0' })
  const res = await fetch(`${apiHost}/api/conversations/v1/widget/tickets?${params}`, {
    headers: { 'X-Conversations-Token': conversationsToken },
  })
  if (!res.ok) throw new Error(`getTickets failed: ${res.status}`)
  const data = await res.json()
  return Array.isArray(data?.results) ? (data.results as Ticket[]) : []
}

export async function apiGetMessages(ticketId: string, sub: string): Promise<Message[]> {
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

export async function apiSendMessage(
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
      ...(ticketId === null && {
        session_id: posthog.get_session_id(),
        session_context: {
          session_replay_url: posthog.get_session_replay_url({ withTimestamp: true }),
          current_url: window.location.href,
        },
      }),
    }),
  })
  if (!res.ok) throw new Error(`sendMessage failed: ${res.status}`)
  return res.json()
}

export async function apiMarkAsRead(ticketId: string, sub: string): Promise<void> {
  const { apiHost, conversationsToken, widgetSessionId } = getApiConfig(sub)
  await fetch(`${apiHost}/api/conversations/v1/widget/messages/${ticketId}/read`, {
    method: 'POST',
    headers: { 'X-Conversations-Token': conversationsToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({ widget_session_id: widgetSessionId }),
  })
}
