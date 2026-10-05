import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { renderHook } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useService } from './use-service'

let mockServiceType: ServiceType | undefined

jest.mock('../use-service-type/use-service-type', () => ({
  useServiceType: () => ({ data: mockServiceType }),
}))

describe('useService', () => {
  it('does not expose cached application details until the service type is resolved', () => {
    mockServiceType = undefined
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
    const cachedApplication = { id: 'service', serviceType: 'APPLICATION', name: 'cached application' }
    const applicationQuery = queries.services.details({ serviceId: 'service', serviceType: 'APPLICATION' })
    queryClient.setQueryData(applicationQuery.queryKey, cachedApplication)
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result, rerender, unmount } = renderHook(
      () => useService({ environmentId: 'environment', serviceId: 'service' }),
      { wrapper }
    )

    expect(result.current.data).toBeUndefined()
    expect(result.current.fetchStatus).toBe('idle')

    mockServiceType = 'APPLICATION'
    rerender()

    expect(result.current.data).toEqual(cachedApplication)
    unmount()
    queryClient.clear()
  })
})
