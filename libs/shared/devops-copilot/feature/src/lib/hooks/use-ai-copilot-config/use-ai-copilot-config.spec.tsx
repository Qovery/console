import { useQuery } from '@tanstack/react-query'
import { renderHook } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useAICopilotConfig } from './use-ai-copilot-config'

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

jest.mock('@qovery/state/util-queries', () => ({
  queries: {
    devopsCopilot: {
      config: jest.fn(),
    },
  },
}))

describe('useAICopilotConfig', () => {
  const organizationId = 'org-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call useQuery with correct parameters when organizationId is provided', () => {
    const mockConfigQuery = { queryKey: ['devopsCopilot', 'config', organizationId] as const, queryFn: jest.fn() }
    jest.mocked(queries.devopsCopilot.config).mockReturnValue(mockConfigQuery)
    ;(useQuery as jest.Mock).mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useAICopilotConfig({ organizationId }))

    expect(queries.devopsCopilot.config).toHaveBeenCalledWith({ organizationId })
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      })
    )
  })

  it('should disable query when organizationId is empty', () => {
    const mockConfigQuery = { queryKey: ['devopsCopilot', 'config', ''] as const, queryFn: jest.fn() }
    jest.mocked(queries.devopsCopilot.config).mockReturnValue(mockConfigQuery)
    ;(useQuery as jest.Mock).mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useAICopilotConfig({ organizationId: '' }))

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    )
  })

  it('should return query result', () => {
    const mockConfigQuery = { queryKey: ['devopsCopilot', 'config', organizationId] as const, queryFn: jest.fn() }
    const mockResult = {
      data: {
        id: 'config-123',
        title: 'Test Config',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        organization_id: organizationId,
      },
      isLoading: false,
    }
    jest.mocked(queries.devopsCopilot.config).mockReturnValue(mockConfigQuery)
    ;(useQuery as jest.Mock).mockReturnValue(mockResult)

    const { result } = renderHook(() => useAICopilotConfig({ organizationId }))

    expect(result.current).toEqual(mockResult)
  })
})
