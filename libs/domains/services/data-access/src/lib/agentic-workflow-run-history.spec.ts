import { type AgenticWorkflowRun, AgenticWorkflowsApi } from 'qovery-typescript-axios'
import { services } from './domains-services-data-access'

describe('agentic workflow run history', () => {
  it('loads every API page before returning runs', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: `run-${index}` })) as AgenticWorkflowRun[]
    const lastRun = { id: 'run-100' } as AgenticWorkflowRun
    const listRuns = jest.spyOn(AgenticWorkflowsApi.prototype, 'listAgenticWorkflowRunHistory')
    listRuns
      .mockResolvedValueOnce({ data: { results: firstPage } } as never)
      .mockResolvedValueOnce({ data: { results: [lastRun] } } as never)

    const query = services.agenticWorkflowRunHistory({ serviceId: 'workflow-1' })
    const runs = await query.queryFn({} as Parameters<typeof query.queryFn>[0])

    expect(listRuns).toHaveBeenNthCalledWith(1, 'workflow-1', 1, 100)
    expect(listRuns).toHaveBeenNthCalledWith(2, 'workflow-1', 2, 100)
    expect(runs).toHaveLength(101)
    expect(runs[100]).toEqual(lastRun)
    listRuns.mockRestore()
  })
})
