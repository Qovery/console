import { type ReactNode } from 'react'
import { act, renderWithProviders } from '@qovery/shared/util-tests'
import { ServiceDashboard } from './service-dashboard'

const mockUseContainerName = jest.fn()
const mockUseNamespace = jest.fn()
const mockUseService = jest.fn()
let mockSetPodCountFetched: ((value: boolean) => void) | undefined

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ organizationId: 'organization-id', environmentId: 'environment-id', serviceId: 'service-id' }),
}))
jest.mock('@qovery/domains/services/feature', () => ({
  useService: (params: unknown) => mockUseService(params),
}))
jest.mock('../../hooks/use-environment/use-environment', () => ({
  useEnvironment: () => ({ data: { cluster_id: 'cluster-id' } }),
}))
jest.mock('../../hooks/use-container-name/use-container-name', () => ({
  useContainerName: (params: unknown) => mockUseContainerName(params),
}))
jest.mock('../../hooks/use-namespace/use-namespace', () => ({
  useNamespace: (params: unknown) => mockUseNamespace(params),
}))
jest.mock('../../hooks/use-pod-names/use-pod-names', () => ({ usePodNames: () => ({}) }))
jest.mock('../../hooks/use-pod-count/use-pod-count', () => ({
  usePodCount: () => {
    const [isFetched, setIsFetched] = jest.requireActual('react').useState(false)
    mockSetPodCountFetched = setIsFetched
    return { isFetched, podCount: 0 }
  },
}))
jest.mock('../../hooks/use-ingress-name/use-ingress-name', () => ({ useIngressName: () => ({}) }))
jest.mock('../../hooks/use-http-route-name/use-http-route-name', () => ({ __esModule: true, default: () => ({}) }))
jest.mock('../../util-filter/dashboard-context', () => ({
  DashboardProvider: ({ children }: { children: ReactNode }) => children,
  useDashboardContext: () => ({}),
}))

describe('ServiceDashboard discovery queries', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-05T17:15:00.000Z'))
    mockUseContainerName.mockReset().mockReturnValue({ isFetched: false })
    mockUseNamespace.mockReset().mockReturnValue({ isFetched: false })
    mockUseService.mockReset().mockImplementation(({ environmentId }) => ({
      data: environmentId ? { serviceType: 'CONTAINER', ports: [], storage: [] } : undefined,
    }))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('keeps the discovery window unchanged when the dashboard renders again', () => {
    renderWithProviders(<ServiceDashboard />)
    const initialContainerQuery = mockUseContainerName.mock.calls[0][0]
    const initialNamespaceQuery = mockUseNamespace.mock.calls[0][0]

    expect(mockUseService).toHaveBeenCalledWith({ environmentId: 'environment-id', serviceId: 'service-id' })
    expect(initialContainerQuery).toMatchObject({
      startDate: '2026-10-05T16:15:00.000Z',
      endDate: '2026-10-05T17:15:00.000Z',
    })

    act(() => {
      jest.setSystemTime(new Date('2026-10-05T17:15:01.000Z'))
      mockSetPodCountFetched?.(true)
    })

    expect(mockUseContainerName.mock.lastCall?.[0]).toEqual(initialContainerQuery)
    expect(mockUseNamespace.mock.lastCall?.[0]).toEqual(initialNamespaceQuery)
  })
})
