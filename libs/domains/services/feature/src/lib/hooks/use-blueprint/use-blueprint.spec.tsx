import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { type PropsWithChildren } from 'react'
import { renderHook, waitFor } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useBlueprint } from './use-blueprint'

const mockAxiosGet = jest.spyOn(axios, 'get')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useBlueprint', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAxiosGet.mockResolvedValue({ data: { id: 'blueprint-1' } })
  })

  it('should build the query key from the blueprint id', () => {
    expect(queries.services.blueprint({ blueprintId: 'blueprint-1' }).queryKey).toContain('blueprint-1')
  })

  it('should return what the API says happened to the blueprint', async () => {
    const blueprint = {
      id: 'blueprint-1',
      name: 'custom-postgres',
      catalog_url: 'https://github.com/Qovery/service-catalog/aws/postgres',
      tag: 'aws/postgres/17/1.0.0',
      environment_id: 'env-1',
      service_type: 'TERRAFORM',
      service_id: null,
      latest_deployment: {
        id: 'deployment-1',
        execution_id: 'exec-abc-123',
        status: 'FAILED',
        started_at: '2026-09-01T12:00:00.000Z',
        terminated_at: '2026-09-01T12:01:00.000Z',
        error_message: 'variable value is required',
      },
    }
    mockAxiosGet.mockResolvedValue({ data: blueprint })

    const { result } = renderHook(() => useBlueprint({ blueprintId: 'blueprint-1' }), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.data).toEqual(blueprint))
    expect(mockAxiosGet).toHaveBeenCalledWith('/blueprint/blueprint-1')
  })

  it('should not query without a blueprint id', () => {
    renderHook(() => useBlueprint({ blueprintId: '' }), { wrapper: createWrapper() })

    expect(mockAxiosGet).not.toHaveBeenCalled()
  })

  it('should not query while disabled', () => {
    renderHook(() => useBlueprint({ blueprintId: 'blueprint-1', enabled: false }), { wrapper: createWrapper() })

    expect(mockAxiosGet).not.toHaveBeenCalled()
  })
})
