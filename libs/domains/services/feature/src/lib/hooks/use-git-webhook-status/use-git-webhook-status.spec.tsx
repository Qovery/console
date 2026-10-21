import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type GitWebhookStatusResponse, ServiceMainCallsApi } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { renderHook, waitFor } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useGitWebhookStatus } from './use-git-webhook-status'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useGitWebhookStatus', () => {
  it('returns query with correct key for serviceId', () => {
    const queryConfig = queries.services.gitWebhookStatus('service-123')

    expect(queryConfig.queryKey).toContain('service-123')
  })

  it('returns query result when called with serviceId', async () => {
    const webhookStatus: GitWebhookStatusResponse = { status: 'ACTIVE', provider: 'GITHUB' }
    const getServiceGitWebhookStatus = jest
      .spyOn(ServiceMainCallsApi.prototype, 'getServiceGitWebhookStatus')
      .mockResolvedValue({ data: webhookStatus } as never)

    const { result } = renderHook(() => useGitWebhookStatus({ serviceId: 'service-123' }), {
      wrapper: createWrapper(),
    })

    expect(result.current).toBeDefined()
    expect(result.current.isLoading).toBeDefined()
    await waitFor(() => expect(result.current.data).toEqual(webhookStatus))
    expect(getServiceGitWebhookStatus).toHaveBeenCalledWith('service-123')
  })
})
