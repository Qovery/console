import { useQuery } from '@tanstack/react-query'
import { type DeploymentHistoryEnvironmentV2 } from 'qovery-typescript-axios'
import { renderHook } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useDeploymentHistoryExecutionId } from './use-deployment-history-execution-id'

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

const mockUseQuery = useQuery as jest.Mock

const history = (executionId: string) =>
  ({ identifier: { execution_id: executionId } }) as unknown as DeploymentHistoryEnvironmentV2

describe('useDeploymentHistoryExecutionId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shares the deployment history cache polled by the pipeline', () => {
    renderHook(() => useDeploymentHistoryExecutionId({ environmentId: 'env-1', executionId: 'exec-1' }))

    const { queryKey } = mockUseQuery.mock.calls[0][0]
    expect(queryKey).toEqual(
      queries.environments.deploymentHistoryV2({ environmentId: 'env-1', pageSize: 100 }).queryKey
    )
  })

  it('selects the deployment matching the execution id', () => {
    renderHook(() => useDeploymentHistoryExecutionId({ environmentId: 'env-1', executionId: 'exec-2' }))

    const { select } = mockUseQuery.mock.calls[0][0]
    expect(select([history('exec-1'), history('exec-2')])).toEqual(history('exec-2'))
  })

  it('keeps polling until the execution shows up in the history', () => {
    renderHook(() => useDeploymentHistoryExecutionId({ environmentId: 'env-1', executionId: 'exec-1' }))

    const { refetchInterval } = mockUseQuery.mock.calls[0][0]
    expect(refetchInterval(undefined)).toBe(5000)
    expect(refetchInterval(history('exec-1'))).toBe(false)
  })
})
