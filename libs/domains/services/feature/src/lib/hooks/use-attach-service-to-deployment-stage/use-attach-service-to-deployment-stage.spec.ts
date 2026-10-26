import { renderHook } from '@testing-library/react'
import { type mutations } from '@qovery/domains/environments/data-access'
import { useAttachServiceToDeploymentStage } from './use-attach-service-to-deployment-stage'

type StageRequest = Parameters<typeof mutations.attachServiceToDeploymentStage>[0]
const mockMutate = jest.fn()
let mockNotifyOnSuccess: (data: unknown, variables: StageRequest) => { callback?: () => void }

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
  useMutation: (_mutation: unknown, options: { meta: { notifyOnSuccess: typeof mockNotifyOnSuccess } }) => {
    mockNotifyOnSuccess = options.meta.notifyOnSuccess
    return { mutate: mockMutate }
  },
}))

describe('deployment stage Undo', () => {
  beforeEach(() => jest.clearAllMocks())

  it.each(['source', 'target'])('passes the current stage to Undo after updating stage %s', (stageId) => {
    renderHook(() => useAttachServiceToDeploymentStage())
    const previous = { stageId: 'source', serviceId: 'service', isSkipped: true }
    const current = { stageId, serviceId: 'service', isSkipped: false }

    const notification = mockNotifyOnSuccess(undefined, { ...current, prevStage: previous })
    expect(notification.callback).toBeDefined()
    notification.callback?.()

    expect(mockMutate).toHaveBeenCalledWith({ ...previous, prevStage: current })
  })

  it('keeps repeated Undo requests flat and preserves both skipped states', () => {
    renderHook(() => useAttachServiceToDeploymentStage())
    const previous = { stageId: 'source', serviceId: 'service', isSkipped: true }
    const current = { stageId: 'target', serviceId: 'service', isSkipped: false }

    mockNotifyOnSuccess(undefined, { ...current, prevStage: previous }).callback?.()
    mockNotifyOnSuccess(undefined, mockMutate.mock.calls[0][0]).callback?.()

    expect(mockMutate).toHaveBeenNthCalledWith(2, { ...current, prevStage: previous })
  })

  it('does not offer Undo without a previous stage', () => {
    renderHook(() => useAttachServiceToDeploymentStage())
    expect(mockNotifyOnSuccess(undefined, { stageId: 'source', serviceId: 'service' }).callback).toBeUndefined()
  })
})
