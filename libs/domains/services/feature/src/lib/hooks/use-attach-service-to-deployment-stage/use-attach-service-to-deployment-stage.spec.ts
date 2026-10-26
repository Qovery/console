import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { type PropsWithChildren, createElement } from 'react'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'
import { useAttachServiceToDeploymentStage } from './use-attach-service-to-deployment-stage'

describe('deployment stage mutations', () => {
  let queryClient: QueryClient
  let undo: (() => void) | undefined
  let attach: jest.SpyInstance

  beforeEach(() => {
    undo = undefined
    attach = jest.spyOn(mutations, 'attachServiceToDeploymentStage').mockResolvedValue([])
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      logger: { log: console.log, warn: console.warn, error: jest.fn() },
      mutationCache: new MutationCache({
        onSuccess(data, variables, _context, mutation) {
          const notify = mutation.meta?.notifyOnSuccess
          if (typeof notify === 'function') {
            undo = notify(data, variables).callback
          }
        },
      }),
    })
    jest.spyOn(queryClient, 'invalidateQueries')
  })

  afterEach(() => {
    queryClient.clear()
    jest.restoreAllMocks()
  })

  function wrapper({ children }: PropsWithChildren) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }

  it.each(['source', 'target'])('executes Undo with current stage %s as its previous state', async (stageId) => {
    const { result } = renderHook(() => useAttachServiceToDeploymentStage(), { wrapper })
    const previous = { stageId: 'source', serviceId: 'service', isSkipped: true }
    const current = { stageId, serviceId: 'service', isSkipped: false }

    await act(async () => {
      await result.current.mutateAsync({ ...current, prevStage: previous })
    })
    expect(attach).toHaveBeenNthCalledWith(1, { ...current, prevStage: previous })
    expect(undo).toBeDefined()
    await act(async () => {
      undo?.()
    })
    await waitFor(() => expect(attach).toHaveBeenNthCalledWith(2, { ...previous, prevStage: current }))
  })

  it('keeps repeated Undo requests flat and preserves both skipped states', async () => {
    const { result } = renderHook(() => useAttachServiceToDeploymentStage(), { wrapper })
    const previous = { stageId: 'source', serviceId: 'service', isSkipped: true }
    const current = { stageId: 'target', serviceId: 'service', isSkipped: false }

    await act(async () => {
      await result.current.mutateAsync({ ...current, prevStage: previous })
    })
    await act(async () => {
      undo?.()
    })
    await waitFor(() => expect(attach).toHaveBeenCalledTimes(2))
    await act(async () => {
      undo?.()
    })
    await waitFor(() => expect(attach).toHaveBeenNthCalledWith(3, { ...current, prevStage: previous }))
  })

  it('does not offer Undo without a previous stage', async () => {
    const { result } = renderHook(() => useAttachServiceToDeploymentStage(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ stageId: 'source', serviceId: 'service' })
    })
    expect(undo).toBeUndefined()
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queries.environments.listDeploymentStages._def,
    })
  })

  it('refreshes each returned environment once after a successful mutation', async () => {
    attach.mockResolvedValue([
      { environment: { id: 'env-1' } },
      { environment: { id: 'env-1' } },
      { environment: { id: 'env-2' } },
    ])
    const { result } = renderHook(() => useAttachServiceToDeploymentStage(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ stageId: 'source', serviceId: 'service' })
    })

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2)
    for (const environmentId of ['env-1', 'env-2']) {
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queries.environments.listDeploymentStages({ environmentId }).queryKey,
      })
    }
  })

  it('refreshes stages after an API error and propagates the failure', async () => {
    attach.mockRejectedValueOnce(new Error('Move failed'))
    const { result } = renderHook(() => useAttachServiceToDeploymentStage(), { wrapper })
    await act(async () => {
      await expect(result.current.mutateAsync({ stageId: 'target', serviceId: 'service' })).rejects.toThrow(
        'Move failed'
      )
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queries.environments.listDeploymentStages._def,
    })
    expect(undo).toBeUndefined()
  })
})
