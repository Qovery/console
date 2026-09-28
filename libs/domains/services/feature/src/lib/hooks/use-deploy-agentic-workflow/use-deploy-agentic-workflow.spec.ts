import { QueryClient } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'
import { useDeployAgenticWorkflow } from './use-deploy-agentic-workflow'

const mockQueryClient = new QueryClient()
const mockUseMutation = jest.fn()

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => mockQueryClient,
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}))

jest.mock('@qovery/shared/ui', () => ({
  toast: jest.fn(),
}))

describe('useDeployAgenticWorkflow', () => {
  it('invalidates run history for the triggered service', () => {
    const runHistory = queries.services.agenticWorkflowRunHistory({ serviceId: 'workflow-1' }).queryKey
    const recentRuns = queries.services.agenticWorkflowRunHistory({ serviceId: 'workflow-1', limit: 5 }).queryKey
    const otherService = queries.services.agenticWorkflowRunHistory({ serviceId: 'workflow-2' }).queryKey
    mockQueryClient.setQueryData(runHistory, [])
    mockQueryClient.setQueryData(recentRuns, [])
    mockQueryClient.setQueryData(otherService, [])

    useDeployAgenticWorkflow({ environmentId: 'env-1', serviceId: 'workflow-1' })
    const options = mockUseMutation.mock.calls[0][1] as { onSuccess: () => void }
    options.onSuccess()

    expect(mockQueryClient.getQueryState(runHistory)?.isInvalidated).toBe(true)
    expect(mockQueryClient.getQueryState(recentRuns)?.isInvalidated).toBe(true)
    expect(mockQueryClient.getQueryState(otherService)?.isInvalidated).toBe(false)
  })
})
