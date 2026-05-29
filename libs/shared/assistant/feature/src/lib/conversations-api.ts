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
  const widgetSessionId = distinctIdToUUID(sub)
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
