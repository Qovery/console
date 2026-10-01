import { useCallback, useState } from 'react'
import { useVariables } from '@qovery/domains/variables/feature'
import { act, renderHook } from '@qovery/shared/util-tests'
import { useBlueprintDbInstance } from './use-blueprint-db-instance'

jest.mock('@qovery/domains/variables/feature', () => ({ useVariables: jest.fn() }))

const mockUseVariables = useVariables as jest.Mock
const serviceId = '04d06b19-323e-41eb-b77f-508f428bd573'
const variable = {
  key: 'QOVERY_OUTPUT_TERRAFORM_Z04D06B19_DB_IDENTIFIER',
  value: 'my-rds-instance',
  is_secret: false,
}

describe('useBlueprintDbInstance', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('refreshes the output after deployment, including when an identifier already exists', async () => {
    const refetch = jest.fn().mockResolvedValue({ isError: false, data: [variable] })
    mockUseVariables.mockReturnValue({ data: [variable], isLoading: false, isError: false, refetch })

    const { result, rerender } = renderHook(
      ({ deploymentExecutionId }) =>
        useBlueprintDbInstance({ serviceId, enabled: true, deploymentFinished: true, deploymentExecutionId }),
      { initialProps: { deploymentExecutionId: 'first' } }
    )

    expect(result.current.dbInstance).toBe('my-rds-instance')
    expect(refetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      await Promise.resolve()
    })
    rerender({ deploymentExecutionId: 'second' })

    expect(refetch).toHaveBeenCalledTimes(2)
  })

  it('only reads the output when the caller does not wait for a deployment', () => {
    const refetch = jest.fn().mockResolvedValue({ isError: false, data: [] })
    mockUseVariables.mockReturnValue({ data: [variable], isLoading: false, isError: false, refetch })

    const { result } = renderHook(() => useBlueprintDbInstance({ serviceId, enabled: true }))

    expect(result.current.dbInstance).toBe('my-rds-instance')
    expect(refetch).not.toHaveBeenCalled()
    expect(jest.getTimerCount()).toBe(0)
  })

  it('exposes an identifier found on a later poll and stops retrying', async () => {
    const refetch = jest
      .fn()
      .mockResolvedValueOnce({ isError: false, data: [] })
      .mockResolvedValueOnce({ isError: false, data: [variable] })

    function useVariablesAfterRefresh() {
      const [data, setData] = useState<(typeof variable)[]>([])
      const fetchOutput = useCallback(async () => {
        const result = await refetch()
        setData(result.data)
        return result
      }, [])
      return { data, isLoading: false, isError: false, refetch: fetchOutput }
    }

    mockUseVariables.mockImplementation(useVariablesAfterRefresh)
    const { result } = renderHook(() => useBlueprintDbInstance({ serviceId, enabled: true, deploymentFinished: true }))

    expect(result.current.dbInstance).toBeUndefined()
    await act(async () => {
      await Promise.resolve()
    })
    expect(refetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      jest.advanceTimersByTime(15_000)
      await Promise.resolve()
    })

    expect(result.current.dbInstance).toBe('my-rds-instance')
    expect(refetch).toHaveBeenCalledTimes(2)
    expect(jest.getTimerCount()).toBe(0)
  })

  it('stops after six refreshes when the Terraform output stays missing', async () => {
    const refetch = jest.fn().mockResolvedValue({ isError: false, data: [] })
    mockUseVariables.mockReturnValue({ data: [], isLoading: false, isError: false, refetch })

    renderHook(() => useBlueprintDbInstance({ serviceId, enabled: true, deploymentFinished: true }))
    expect(refetch).toHaveBeenCalledTimes(1)

    for (let attempt = 1; attempt < 6; attempt += 1) {
      await act(async () => {
        await Promise.resolve()
        jest.advanceTimersByTime(15_000)
        await Promise.resolve()
      })
    }

    expect(refetch).toHaveBeenCalledTimes(6)
    expect(jest.getTimerCount()).toBe(0)
  })
})
