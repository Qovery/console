import { renderHook } from '@testing-library/react'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useServiceLiveLogs } from './use-service-live-logs'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'organization-1',
    projectId: 'project-1',
    environmentId: 'environment-1',
  }),
  useSearch: () => ({}),
}))

jest.mock('@qovery/state/util-queries', () => ({
  useReactQueryWsSubscription: jest.fn(),
}))

describe('useServiceLiveLogs', () => {
  it('passes the service type to the live logs websocket params', () => {
    renderHook(() =>
      useServiceLiveLogs({
        clusterId: 'cluster-1',
        serviceId: 'service-1',
        serviceType: 'ARGOCD_APP',
        enabled: true,
      })
    )

    expect(useReactQueryWsSubscription).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        urlSearchParams: expect.objectContaining({
          service_type: 'ARGOCD_APP',
        }),
      })
    )
  })
})
