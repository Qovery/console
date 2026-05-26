import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { type PropsWithChildren } from 'react'
import useListStatuses from '../use-list-statuses/use-list-statuses'
import { useDeploymentStatus } from './use-deployment-status'

jest.mock('../use-list-statuses/use-list-statuses')

const mockUseListStatuses = useListStatuses as jest.MockedFunction<typeof useListStatuses>

const helmStatus = { id: 'helm-svc-1', state: 'RUNNING' } as never
const terraformStatus = { id: 'tf-svc-1', state: 'STOPPED' } as never

const emptyEnvStatus = {
  data: { applications: [], containers: [], databases: [], jobs: [], helms: [], terraforms: [] },
  isLoading: false,
} as never

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useDeploymentStatus HTTP fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns helm service status when helms array contains the service', () => {
    mockUseListStatuses.mockReturnValue({
      ...emptyEnvStatus,
      data: { ...emptyEnvStatus.data, helms: [helmStatus] },
    })

    const { result } = renderHook(() => useDeploymentStatus({ environmentId: 'env-1', serviceId: 'helm-svc-1' }), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toEqual(helmStatus)
  })

  it('returns terraform service status when terraforms array contains the service', () => {
    mockUseListStatuses.mockReturnValue({
      ...emptyEnvStatus,
      data: { ...emptyEnvStatus.data, terraforms: [terraformStatus] },
    })

    const { result } = renderHook(() => useDeploymentStatus({ environmentId: 'env-1', serviceId: 'tf-svc-1' }), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toEqual(terraformStatus)
  })

  it('returns undefined when service id is not found in any status list', () => {
    mockUseListStatuses.mockReturnValue(emptyEnvStatus)

    const { result } = renderHook(() => useDeploymentStatus({ environmentId: 'env-1', serviceId: 'unknown-id' }), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeUndefined()
  })
})
