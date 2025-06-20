import { createQueryKeys } from '@lukemorales/query-key-factory'

export const HACKATHON_API_BASE_URL = 'https://p8080-z7df85604-zb0f30ecb-gtw.qovery.com'

export const devopsCopilot = createQueryKeys('devopsCopilot', {
  thread: ({
    userId,
    organizationId,
    threadId,
    token,
  }: {
    userId: string
    organizationId: string
    threadId: string
    token: string
  }) => ({
    queryKey: [organizationId, userId, threadId],
    async queryFn() {
      const response = await fetch(
        `${HACKATHON_API_BASE_URL}/owner/${userId}/organization/${organizationId}/thread/${threadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch thread')
      }

      return response
    },
  }),
})

export const mutations = {}
