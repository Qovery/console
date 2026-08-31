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
      service_id: null,
      latest_deployment: { status: 'FAILED', error_message: 'terraform apply failed' },
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
