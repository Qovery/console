import { useMutation, useQueryClient } from '@tanstack/react-query'
import { devopsCopilot, mutations } from '@qovery/shared/devops-copilot/data-access'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { act, renderHook } from '@qovery/shared/util-tests'
import { useDeleteAICopilotRecurringTask } from './use-delete-ai-copilot-recurring-task'

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}))

jest.mock('@qovery/shared/devops-copilot/data-access', () => ({
  devopsCopilot: {
    recurringTasks: jest.fn(),
  },
  mutations: {
    deleteRecurringTask: jest.fn(),
  },
}))

jest.mock('@qovery/shared/ui', () => ({
  ToastEnum: {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
  },
  toast: jest.fn(),
}))

describe('useDeleteAICopilotRecurringTask', () => {
  const organizationId = 'org-123'
  let mockQueryClient: {
    invalidateQueries: jest.Mock
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockQueryClient = {
      invalidateQueries: jest.fn(),
    }
    ;(useQueryClient as jest.Mock).mockReturnValue(mockQueryClient)
    jest
      .mocked(devopsCopilot.recurringTasks)
      .mockReturnValue({ queryKey: ['devopsCopilot', 'recurringTasks', organizationId] } as never)
  })

  it('should call mutationFn with correct parameters', () => {
    let capturedMutationFn: ((args: { taskId: string }) => Promise<void>) | undefined
    ;(useMutation as jest.Mock).mockImplementation(({ mutationFn }) => {
      capturedMutationFn = mutationFn
      return { mutate: jest.fn() }
    })

    renderHook(() => useDeleteAICopilotRecurringTask({ organizationId }))

    expect(capturedMutationFn).toBeDefined()

    capturedMutationFn?.({ taskId: 'task-123' })
    expect(mutations.deleteRecurringTask).toHaveBeenCalledWith({
      organizationId,
      taskId: 'task-123',
    })
  })

  it('should invalidate queries and show success toast on success', () => {
    let capturedOnSuccess: ((data: unknown, variables: { taskId: string }, context: unknown) => void) | undefined
    ;(useMutation as jest.Mock).mockImplementation(({ onSuccess }) => {
      capturedOnSuccess = onSuccess
      return { mutate: jest.fn() }
    })

    renderHook(() => useDeleteAICopilotRecurringTask({ organizationId }))

    act(() => {
      capturedOnSuccess?.({}, { taskId: 'task-123' }, undefined)
    })

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['devopsCopilot', 'recurringTasks', organizationId],
    })
    expect(toast).toHaveBeenCalledWith(ToastEnum.SUCCESS, 'Task deleted successfully')
  })

  it('should show error toast on error', () => {
    let capturedOnError: ((err: unknown, variables: { taskId: string }, context: unknown) => void) | undefined
    ;(useMutation as jest.Mock).mockImplementation(({ onError }) => {
      capturedOnError = onError
      return { mutate: jest.fn() }
    })

    renderHook(() => useDeleteAICopilotRecurringTask({ organizationId }))

    act(() => {
      capturedOnError?.(new Error('Test error'), { taskId: 'task-123' }, undefined)
    })

    expect(toast).toHaveBeenCalledWith(ToastEnum.ERROR, 'Failed to delete task', 'Please try again later')
  })
})
