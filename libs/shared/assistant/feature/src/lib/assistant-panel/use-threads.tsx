import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { HACKATHON_API_BASE_URL } from './submit-message'

export interface Thread {
  id: string
  title: string
  created_at: string
  updated_at: string
  organization_id: string
}

interface UseThreadsReturn {
  threads: Thread[]
  isLoading: boolean
  error: string | null
  refetchThreads: () => Promise<void>
}

export const useThreads = (organizationId: string, threadId?: string): UseThreadsReturn => {
  const { getAccessTokenSilently } = useAuth0()
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchThreads = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = await getAccessTokenSilently()
      const response = await fetch(`${HACKATHON_API_BASE_URL}/organization/${organizationId}/thread`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching threads: ${response.status}`)
      }

      const data = await response.json()
      setThreads(data.threads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [organizationId, threadId])

  return {
    threads,
    isLoading,
    error,
    refetchThreads: fetchThreads,
  }
}
