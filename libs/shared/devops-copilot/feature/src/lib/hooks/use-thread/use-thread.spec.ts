import { useQuery } from '@tanstack/react-query'
import { renderHook } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useThread } from './use-thread'

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

jest.mock('@qovery/state/util-queries', () => ({
  queries: {
    devopsCopilot: {
      thread: jest.fn(),
    },
  },
}))

describe('useThread', () => {
  const userId = 'user-123'
  const organizationId = 'org-123'
  const threadId = 'thread-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call useQuery with correct parameters', () => {
    const mockThreadQuery = { queryKey: ['devopsCopilot', 'thread', threadId] as const, queryFn: jest.fn() }
    jest.mocked(queries.devopsCopilot.thread).mockReturnValue(mockThreadQuery as never)
    ;(useQuery as jest.Mock).mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useThread({ userId, organizationId, threadId }))

    expect(queries.devopsCopilot.thread).toHaveBeenCalledWith({ userId, organizationId, threadId })
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: undefined,
      })
    )
  })

  it('should pass enabled parameter to useQuery', () => {
    const mockThreadQuery = { queryKey: ['devopsCopilot', 'thread', threadId] as const, queryFn: jest.fn() }
    jest.mocked(queries.devopsCopilot.thread).mockReturnValue(mockThreadQuery as never)
    ;(useQuery as jest.Mock).mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useThread({ userId, organizationId, threadId, enabled: false }))

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    )
  })

  it('should return query result', () => {
    const mockThreadQuery = { queryKey: ['devopsCopilot', 'thread', threadId] as const, queryFn: jest.fn() }
    const mockResult = { data: { id: threadId, messages: [] }, isLoading: false }
    jest.mocked(queries.devopsCopilot.thread).mockReturnValue(mockThreadQuery as never)
    ;(useQuery as jest.Mock).mockReturnValue(mockResult)

    const { result } = renderHook(() => useThread({ userId, organizationId, threadId }))

    expect(result.current).toEqual(mockResult)
  })
})
