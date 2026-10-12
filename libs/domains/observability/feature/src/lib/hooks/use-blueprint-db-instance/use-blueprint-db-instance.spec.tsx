import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'
import { act, renderHook } from '@qovery/shared/util-tests'
import { useBlueprintDbInstance } from './use-blueprint-db-instance'

const mockFetchVariables = jest.fn()
const serviceId = '04d06b19-323e-41eb-b77f-508f428bd573'
const variable = {
  key: 'QOVERY_OUTPUT_TERRAFORM_Z04D06B19_DB_IDENTIFIER',
  value: 'my-rds-instance',
  is_secret: false,
}

jest.mock('@qovery/state/util-queries', () => ({
  queries: {
    variables: {
      list: ({ parentId, scope, isSecret }: { parentId: string; scope: string; isSecret: boolean }) => ({
        queryKey: ['variables', parentId, scope, isSecret],
        queryFn: () => mockFetchVariables(),
      }),
    },
  },
}))

interface HookProps {
  deploymentFinished: boolean
  deploymentExecutionId: string
}

function renderInstanceHook(initialProps: HookProps) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, cacheTime: Infinity } } })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return renderHook(
    ({ deploymentFinished, deploymentExecutionId }: HookProps) =>
      useBlueprintDbInstance({ serviceId, enabled: true, deploymentFinished, deploymentExecutionId }),
    { wrapper, initialProps }
  )
}

async function flushQueries() {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(0)
  })
}

describe('useBlueprintDbInstance', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.resetAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('invalidates the output after each completed deployment, including when an identifier already exists', async () => {
    mockFetchVariables.mockResolvedValue([variable])
    const { result, rerender } = renderInstanceHook({ deploymentFinished: false, deploymentExecutionId: 'first' })
    await flushQueries()
    expect(result.current.dbInstance).toBe('my-rds-instance')
    expect(mockFetchVariables).toHaveBeenCalledTimes(1)

    rerender({ deploymentFinished: true, deploymentExecutionId: 'first' })
    await flushQueries()
    expect(mockFetchVariables).toHaveBeenCalledTimes(2)

    rerender({ deploymentFinished: true, deploymentExecutionId: 'second' })
    await flushQueries()
    expect(mockFetchVariables).toHaveBeenCalledTimes(3)
  })

  it('only reads the output when no deployment completion is being watched', async () => {
    mockFetchVariables.mockResolvedValue([variable])
    const { result } = renderInstanceHook({ deploymentFinished: false, deploymentExecutionId: 'first' })
    await flushQueries()

    expect(result.current.dbInstance).toBe('my-rds-instance')
    await act(async () => {
      await jest.advanceTimersByTimeAsync(90_000)
    })
    expect(mockFetchVariables).toHaveBeenCalledTimes(1)
  })

  it('exposes an identifier found on a later refresh and stops polling', async () => {
    mockFetchVariables.mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([variable])
    const { result, rerender } = renderInstanceHook({ deploymentFinished: false, deploymentExecutionId: 'first' })
    await flushQueries()
    expect(result.current.dbInstance).toBeUndefined()

    rerender({ deploymentFinished: true, deploymentExecutionId: 'first' })
    await flushQueries()
    expect(mockFetchVariables).toHaveBeenCalledTimes(2)

    await act(async () => {
      await jest.advanceTimersByTimeAsync(90_000)
    })
    await flushQueries()
    expect(result.current.dbInstance).toBe('my-rds-instance')
    expect(mockFetchVariables).toHaveBeenCalledTimes(3)

    await act(async () => {
      await jest.advanceTimersByTimeAsync(90_000)
    })
    expect(mockFetchVariables).toHaveBeenCalledTimes(3)
  })

  it('stops after six refreshes when the Terraform output stays missing', async () => {
    mockFetchVariables.mockResolvedValue([])
    const { rerender } = renderInstanceHook({ deploymentFinished: false, deploymentExecutionId: 'first' })
    await flushQueries()
    expect(mockFetchVariables).toHaveBeenCalledTimes(1)

    rerender({ deploymentFinished: true, deploymentExecutionId: 'first' })
    await flushQueries()
    await act(async () => {
      await jest.advanceTimersByTimeAsync(90_000)
    })
    expect(mockFetchVariables).toHaveBeenCalledTimes(7)

    await act(async () => {
      await jest.advanceTimersByTimeAsync(30_000)
    })
    expect(mockFetchVariables).toHaveBeenCalledTimes(7)
  })
})
