import { useQuery } from '@tanstack/react-query'
import { devopsCopilot } from '@qovery/shared/devops-copilot/data-access'
import { renderHook } from '@qovery/shared/util-tests'
import { useAICopilotRecurringTasks } from './use-ai-copilot-recurring-tasks'

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

jest.mock('@qovery/shared/devops-copilot/data-access', () => ({
  devopsCopilot: {
    recurringTasks: jest.fn(),
  },
}))

describe('useAICopilotRecurringTasks', () => {
  const organizationId = 'org-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call useQuery with correct parameters when organizationId is provided', () => {
    const mockRecurringTasksQuery = {
      queryKey: ['devopsCopilot', 'recurringTasks', organizationId] as const,
      queryFn: jest.fn(),
    }
    jest.mocked(devopsCopilot.recurringTasks).mockReturnValue(mockRecurringTasksQuery as never)
    ;(useQuery as jest.Mock).mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useAICopilotRecurringTasks({ organizationId }))

    expect(devopsCopilot.recurringTasks).toHaveBeenCalledWith({ organizationId })
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      })
    )
  })

  it('should disable query when organizationId is empty', () => {
    const mockRecurringTasksQuery = { queryKey: ['devopsCopilot', 'recurringTasks', ''] as const, queryFn: jest.fn() }
    jest.mocked(devopsCopilot.recurringTasks).mockReturnValue(mockRecurringTasksQuery as never)
    ;(useQuery as jest.Mock).mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useAICopilotRecurringTasks({ organizationId: '' }))

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    )
  })

  it('should return query result', () => {
    const mockRecurringTasksQuery = {
      queryKey: ['devopsCopilot', 'recurringTasks', organizationId] as const,
      queryFn: jest.fn(),
    }
    const mockResult = {
      data: [
        { id: 'task-1', name: 'Task 1', enabled: true },
        { id: 'task-2', name: 'Task 2', enabled: false },
      ],
      isLoading: false,
    }
    jest.mocked(devopsCopilot.recurringTasks).mockReturnValue(mockRecurringTasksQuery as never)
    ;(useQuery as jest.Mock).mockReturnValue(mockResult)

    const { result } = renderHook(() => useAICopilotRecurringTasks({ organizationId }))

    expect(result.current).toEqual(mockResult)
  })
})
