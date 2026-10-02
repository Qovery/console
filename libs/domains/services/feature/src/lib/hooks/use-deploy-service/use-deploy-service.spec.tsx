import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useDeployService } from './use-deploy-service'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => jest.fn(),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  toast: jest.fn(),
}))

describe('useDeployService', () => {
  let queryClient: QueryClient
  let mockAxiosRequest: jest.SpiedFunction<typeof axios.request>
  let unmount: (() => void) | undefined

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    mockAxiosRequest = jest.spyOn(axios, 'request')
    unmount = undefined
  })

  afterEach(() => {
    try {
      unmount?.()
    } finally {
      queryClient.clear()
      mockAxiosRequest.mockRestore()
    }
  })

  it('invalidates all service and environment history pages after deployment without affecting unrelated histories', async () => {
    const service = { serviceId: 'service', serviceType: 'APPLICATION' as const }
    const histories = [undefined, 10, 100].flatMap((pageSize) => [
      queries.services.deploymentHistory({ ...service, pageSize }),
      queries.environments.deploymentHistoryV2({ environmentId: 'environment', pageSize }),
    ])
    const unrelated = [
      queries.services.deploymentHistory({ ...service, serviceId: 'other-service', pageSize: 100 }),
      queries.services.deploymentHistory({ ...service, serviceType: 'JOB', pageSize: 100 }),
      queries.environments.deploymentHistoryV2({ environmentId: 'other-environment', pageSize: 100 }),
    ]
    for (const history of [...histories, ...unrelated]) {
      queryClient.setQueryData(history.queryKey, [])
    }
    mockAxiosRequest.mockResolvedValueOnce({ data: { id: service.serviceId } })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const hook = renderHook(
      () => useDeployService({ organizationId: 'organization', projectId: 'project', environmentId: 'environment' }),
      { wrapper }
    )

    unmount = hook.unmount

    await act(async () => {
      await hook.result.current.mutateAsync(service)
    })

    expect(mockAxiosRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.stringContaining('/application/service/deploy') })
    )
    for (const history of histories) {
      expect(queryClient.getQueryState(history.queryKey)?.isInvalidated).toBe(true)
    }
    for (const history of unrelated) {
      expect(queryClient.getQueryState(history.queryKey)?.isInvalidated).toBe(false)
    }
  })
})
