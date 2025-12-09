import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { type Thread } from '../../devops-copilot-panel/devops-copilot-panel'
import { useThread } from '../use-thread/use-thread'

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

type RawMessage = {
  id: number
  media_content: string
  owner: 'user' | 'assistant'
  created_at: string
  vote_type?: 'upvote' | 'downvote'
}

export function useThreadState({ organizationId, threadId }: UseCurrentThreadOptions): UseCurrentThreadResult {
  const [thread, setThread] = useState<Thread>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth0()
  const userSub = user?.sub || ''

  const { data } = useThread({
    userId: userSub,
    organizationId,
    threadId: threadId || '',
    enabled: !!threadId,
  })

  useEffect(() => {
    if (!threadId) {
      setThread([])
      return
    }

    const loadThread = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const messages = data.results || []

        const formattedMessages: Thread = messages.map((msg: RawMessage) => ({
          id: msg.id,
          text: msg.media_content,
          owner: msg.owner,
          timestamp: new Date(msg.created_at).getTime(),
          vote: msg.vote_type,
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

    if (data?.results) {
      loadThread()
    }
  }, [threadId, data])

  return {
    thread,
    setThread,
    isLoading,
    error,
  }
}
