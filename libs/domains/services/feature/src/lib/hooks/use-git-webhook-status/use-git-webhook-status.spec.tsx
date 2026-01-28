import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'
import { renderHook } from '@qovery/shared/util-tests'
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

  it('returns query result when called with serviceId', () => {
    const { result } = renderHook(() => useGitWebhookStatus({ serviceId: 'service-123' }), {
      wrapper: createWrapper(),
    })

    expect(result.current).toBeDefined()
    expect(result.current.isLoading).toBeDefined()
  })
})
