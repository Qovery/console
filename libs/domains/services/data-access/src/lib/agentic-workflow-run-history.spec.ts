import { type AgenticWorkflowRun, AgenticWorkflowsApi } from 'qovery-typescript-axios'
import { services } from './domains-services-data-access'

describe('agentic workflow run history', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('loads only the 100 latest runs', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: `run-${index}` })) as AgenticWorkflowRun[]
    const listRuns = jest.spyOn(AgenticWorkflowsApi.prototype, 'listAgenticWorkflowRunHistory')
    listRuns.mockResolvedValueOnce({ data: { results: firstPage } } as never)

    const query = services.agenticWorkflowRunHistory({ serviceId: 'workflow-1' })
    const runs = await query.queryFn({} as Parameters<typeof query.queryFn>[0])

    expect(listRuns).toHaveBeenCalledTimes(1)
    expect(listRuns).toHaveBeenCalledWith('workflow-1', 1, 100)
    expect(runs).toEqual(firstPage)
  })

  it('loads only the latest run for the overview', async () => {
    const recentRuns = [{ id: 'recent-run' }] as AgenticWorkflowRun[]
    const listRuns = jest.spyOn(AgenticWorkflowsApi.prototype, 'listAgenticWorkflowRunHistory')
    listRuns.mockResolvedValueOnce({ data: { results: recentRuns } } as never)

    const query = services.agenticWorkflowRunHistory({ serviceId: 'workflow-1', limit: 1 })
    const runs = await query.queryFn({} as Parameters<typeof query.queryFn>[0])

    expect(listRuns).toHaveBeenCalledTimes(1)
    expect(listRuns).toHaveBeenCalledWith('workflow-1', 1, 1)
    expect(runs).toEqual(recentRuns)
  })
})
