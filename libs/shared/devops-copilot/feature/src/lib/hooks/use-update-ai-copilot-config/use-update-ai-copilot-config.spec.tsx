import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type AICopilotConfigResponse, devopsCopilot, mutations } from '@qovery/shared/devops-copilot/data-access'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { act, renderHook } from '@qovery/shared/util-tests'
import { useUpdateAICopilotConfig } from './use-update-ai-copilot-config'

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}))

jest.mock('@qovery/shared/devops-copilot/data-access', () => ({
  devopsCopilot: {
    config: jest.fn(),
  },
  mutations: {
    updateOrgConfig: jest.fn(),
  },
}))

jest.mock('@qovery/shared/ui', () => ({
  ToastEnum: {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
  },
  toast: jest.fn(),
}))

describe('useUpdateAICopilotConfig', () => {
  const organizationId = 'org-123'
  const instructions = 'Test instructions'
  let mockQueryClient: {
    cancelQueries: jest.Mock
    getQueryData: jest.Mock
    setQueryData: jest.Mock
    invalidateQueries: jest.Mock
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockQueryClient = {
      cancelQueries: jest.fn(),
      getQueryData: jest.fn(),
      setQueryData: jest.fn(),
      invalidateQueries: jest.fn(),
    }
    ;(useQueryClient as jest.Mock).mockReturnValue(mockQueryClient)
    jest
      .mocked(devopsCopilot.config)
      .mockReturnValue({ queryKey: ['devopsCopilot', 'config', organizationId] } as never)
  })

  it('should call mutationFn with correct parameters', () => {
    let capturedMutationFn: ((args: { enabled: boolean; readOnly: boolean }) => Promise<void>) | undefined
    ;(useMutation as jest.Mock).mockImplementation(({ mutationFn }) => {
      capturedMutationFn = mutationFn
      return { mutate: jest.fn() }
    })

    renderHook(() => useUpdateAICopilotConfig({ organizationId, instructions }))

    expect(capturedMutationFn).toBeDefined()

    capturedMutationFn?.({ enabled: true, readOnly: false })
    expect(mutations.updateOrgConfig).toHaveBeenCalledWith({
      organizationId,
      enabled: true,
      readOnly: false,
      instructions,
    })
  })

  it('should use empty string when instructions are not provided', () => {
    let capturedMutationFn: ((args: { enabled: boolean; readOnly: boolean }) => Promise<void>) | undefined
    ;(useMutation as jest.Mock).mockImplementation(({ mutationFn }) => {
      capturedMutationFn = mutationFn
      return { mutate: jest.fn() }
    })

    renderHook(() => useUpdateAICopilotConfig({ organizationId }))

    capturedMutationFn?.({ enabled: true, readOnly: true })
    expect(mutations.updateOrgConfig).toHaveBeenCalledWith({
      organizationId,
      enabled: true,
      readOnly: true,
      instructions: '',
    })
  })

  it('should handle onMutate correctly', async () => {
    const previousConfig: AICopilotConfigResponse = {
      org_config: { read_only: false, enabled: true, instructions: 'old' },
    }
    const updatedConfig: AICopilotConfigResponse = {
      org_config: { read_only: true, enabled: true, instructions: 'old' },
    }

    let capturedOnMutate: ((args: { enabled: boolean; readOnly: boolean }) => Promise<unknown>) | undefined

    mockQueryClient.getQueryData.mockReturnValue(previousConfig)
    ;(useMutation as jest.Mock).mockImplementation(({ onMutate }) => {
      capturedOnMutate = onMutate
      return { mutate: jest.fn() }
    })

    renderHook(() => useUpdateAICopilotConfig({ organizationId, instructions }))

    const result = await capturedOnMutate?.({ enabled: true, readOnly: true })

    expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({
      queryKey: ['devopsCopilot', 'config', organizationId],
    })
    expect(mockQueryClient.getQueryData).toHaveBeenCalledWith(['devopsCopilot', 'config', organizationId])
    expect(mockQueryClient.setQueryData).toHaveBeenCalled()
    expect(result).toEqual({ previousConfig })
  })

  it('should show success toast when enabling with Read-Only mode', () => {
    let capturedOnSuccess:
      | ((data: unknown, variables: { enabled: boolean; readOnly: boolean }, context: unknown) => void)
      | undefined
    ;(useMutation as jest.Mock).mockImplementation(({ onSuccess }) => {
      capturedOnSuccess = onSuccess
      return { mutate: jest.fn() }
    })

    renderHook(() => useUpdateAICopilotConfig({ organizationId, instructions }))

    act(() => {
      capturedOnSuccess?.({}, { enabled: true, readOnly: true }, undefined)
    })

    expect(toast).toHaveBeenCalledWith(ToastEnum.SUCCESS, 'AI Copilot enabled with Read-Only mode')
  })

  it('should show success toast when enabling with Read-Write mode', () => {
    let capturedOnSuccess:
      | ((data: unknown, variables: { enabled: boolean; readOnly: boolean }, context: unknown) => void)
      | undefined
    ;(useMutation as jest.Mock).mockImplementation(({ onSuccess }) => {
      capturedOnSuccess = onSuccess
      return { mutate: jest.fn() }
    })

    renderHook(() => useUpdateAICopilotConfig({ organizationId, instructions }))

    act(() => {
      capturedOnSuccess?.({}, { enabled: true, readOnly: false }, undefined)
    })

    expect(toast).toHaveBeenCalledWith(ToastEnum.SUCCESS, 'AI Copilot enabled with Read-Write mode')
  })

  it('should show success toast when disabling', () => {
    let capturedOnSuccess:
      | ((data: unknown, variables: { enabled: boolean; readOnly: boolean }, context: unknown) => void)
      | undefined
    ;(useMutation as jest.Mock).mockImplementation(({ onSuccess }) => {
      capturedOnSuccess = onSuccess
      return { mutate: jest.fn() }
    })

    renderHook(() => useUpdateAICopilotConfig({ organizationId, instructions }))

    act(() => {
      capturedOnSuccess?.({}, { enabled: false, readOnly: false }, undefined)
    })

    expect(toast).toHaveBeenCalledWith(ToastEnum.SUCCESS, 'AI Copilot disabled successfully')
  })

  it('should restore previous config and show error toast on error', () => {
    const previousConfig: AICopilotConfigResponse = {
      org_config: { read_only: false, enabled: true, instructions: 'old' },
    }

    let capturedOnError:
      | ((
          err: unknown,
          variables: { enabled: boolean; readOnly: boolean },
          context: { previousConfig: AICopilotConfigResponse } | undefined
        ) => void)
      | undefined
    ;(useMutation as jest.Mock).mockImplementation(({ onError }) => {
      capturedOnError = onError
      return { mutate: jest.fn() }
    })

    renderHook(() => useUpdateAICopilotConfig({ organizationId, instructions }))

    act(() => {
      capturedOnError?.(new Error('Test error'), { enabled: true, readOnly: false }, { previousConfig })
    })

    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      ['devopsCopilot', 'config', organizationId],
      previousConfig
    )
    expect(toast).toHaveBeenCalledWith(
      ToastEnum.ERROR,
      'Failed to update AI Copilot configuration',
      'Please try again later'
    )
  })

  it('should invalidate queries on settled', () => {
    let capturedOnSettled: (() => void) | undefined
    ;(useMutation as jest.Mock).mockImplementation(({ onSettled }) => {
      capturedOnSettled = onSettled
      return { mutate: jest.fn() }
    })

    renderHook(() => useUpdateAICopilotConfig({ organizationId, instructions }))

    act(() => {
      capturedOnSettled?.()
    })

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['devopsCopilot', 'config', organizationId],
    })
  })
})
