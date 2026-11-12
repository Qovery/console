import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { type BuildAnalysisResponse, type BuildAnalysisState } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useStartBuildAnalysis } from './use-start-build-analysis'

describe('useStartBuildAnalysis', () => {
  const variables = { serviceId: 'service-1', serviceType: 'APPLICATION' as const, executionId: 'exec-1' }
  const { queryKey } = queries.services.buildAnalysis(variables)
  const startedAnalysis = { execution_id: 'exec-1', status: 'PENDING' } as BuildAnalysisResponse
  let queryClient: QueryClient
  let mockAxiosRequest: jest.SpiedFunction<typeof axios.request>

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } })
    mockAxiosRequest = jest.spyOn(axios, 'request').mockResolvedValue({ data: startedAnalysis })
  })

  afterEach(() => {
    queryClient.clear()
    mockAxiosRequest.mockRestore()
  })

  it('keeps the started analysis over a read sent before the start', async () => {
    const stateBeforeStart: BuildAnalysisState = { latest_build_execution_id: 'exec-1', analysis: null }
    queryClient.setQueryData(queryKey, stateBeforeStart)
    let answerRead: (state: BuildAnalysisState) => void = () => undefined
    // The read is still on its way when the analysis starts, and answers with the state from before
    const read = queryClient
      .fetchQuery({ queryKey, queryFn: () => new Promise<BuildAnalysisState>((resolve) => (answerRead = resolve)) })
      .catch(() => undefined)
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useStartBuildAnalysis(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(variables)
    })
    await act(async () => {
      answerRead(stateBeforeStart)
      await read
    })

    expect(queryClient.getQueryData(queryKey)).toEqual({
      latest_build_execution_id: 'exec-1',
      analysis: startedAnalysis,
    })
  })
})
