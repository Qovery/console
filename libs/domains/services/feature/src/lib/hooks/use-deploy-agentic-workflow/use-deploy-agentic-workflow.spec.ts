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
  it('invalidates every cached run history page for the triggered service', () => {
    const firstPage = queries.services.agenticWorkflowRunHistory({
      serviceId: 'workflow-1',
      page: 1,
      pageSize: 20,
    }).queryKey
    const laterPage = queries.services.agenticWorkflowRunHistory({
      serviceId: 'workflow-1',
      page: 3,
      pageSize: 20,
    }).queryKey
    const otherService = queries.services.agenticWorkflowRunHistory({
      serviceId: 'workflow-2',
      page: 1,
      pageSize: 20,
    }).queryKey
    mockQueryClient.setQueryData(firstPage, { results: [] })
    mockQueryClient.setQueryData(laterPage, { results: [] })
    mockQueryClient.setQueryData(otherService, { results: [] })

    useDeployAgenticWorkflow({ environmentId: 'env-1', serviceId: 'workflow-1' })
    const options = mockUseMutation.mock.calls[0][1] as { onSuccess: () => void }
    options.onSuccess()

    expect(mockQueryClient.getQueryState(firstPage)?.isInvalidated).toBe(true)
    expect(mockQueryClient.getQueryState(laterPage)?.isInvalidated).toBe(true)
    expect(mockQueryClient.getQueryState(otherService)?.isInvalidated).toBe(false)
  })
})
