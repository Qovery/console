import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { type Thread } from './assistant-panel'
import { HACKATHON_API_BASE_URL } from './submit-message'

interface UseCurrentThreadOptions {
  organizationId: string
  threadId?: string
}

interface UseCurrentThreadResult {
  thread: Thread
  setThread: (thread: Thread) => void
  isLoading: boolean
  error: Error | null
}

async function fetchThread(organizationId: string, threadId: string, token: string) {
  const response = await fetch(`${HACKATHON_API_BASE_URL}/organization/${organizationId}/thread/${threadId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch thread')
  }

  const data = await response.json()
  return data.results || []
}

export function useThread({ organizationId, threadId }: UseCurrentThreadOptions): UseCurrentThreadResult {
  const [thread, setThread] = useState<Thread>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    if (!threadId) {
      setThread([])
      return
    }

    const loadThread = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token = await getAccessTokenSilently()
        const messages = await fetchThread(organizationId, threadId, token)

        // Convertir les messages du format API vers le format Thread
        const formattedMessages: Thread = messages.map((msg: any) => ({
          id: msg.id,
          text: msg.media_content,
          owner: msg.owner,
          timestamp: new Date(msg.created_at).getTime(),
        }))

        setThread(formattedMessages)
      } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error('Failed to load thread')
        console.error('Error loading thread:', errorMessage)
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadThread()
  }, [threadId, getAccessTokenSilently])

  return {
    thread,
    setThread,
    isLoading,
    error,
  }
}
