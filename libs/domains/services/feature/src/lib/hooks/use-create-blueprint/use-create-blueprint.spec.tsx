import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { type BlueprintCreateRequest } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { useCreateBlueprint } from './use-create-blueprint'

// The generated client dispatches every call through `axios.request`
const mockAxiosRequest = jest.spyOn(axios, 'request')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const payload: BlueprintCreateRequest = {
  name: 'custom-postgres',
  tag: 'aws/postgres/17/1.0.0',
  icon: 'https://cdn.qovery.com/icons/postgresql.svg',
  variables: [{ name: 'db_name', value: 'production', is_secret: false }],
}

const creationResponse = {
  id: 'blueprint-1',
  catalog_url: 'https://github.com/Qovery/service-catalog/aws/postgres',
  tag: 'aws/postgres/17/1.0.0',
  environment_id: 'env-1',
  deployment_id: 'deployment-1',
  execution_id: 'exec-abc-123',
}

describe('useCreateBlueprint', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAxiosRequest.mockResolvedValue({ data: creationResponse })
  })

  it('should create through the endpoint that reports the dispatch it started', async () => {
    const { result } = renderHook(() => useCreateBlueprint(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ environmentId: 'env-1', payload, deploy: true })
    })

    expect(mockAxiosRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: expect.stringContaining('/environment/env-1/blueprintDeployment'),
      })
    )
  })

  it('should return the ids of the dispatch it started', async () => {
    const { result } = renderHook(() => useCreateBlueprint(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ environmentId: 'env-1', payload })
    })

    await waitFor(() => expect(result.current.data).toEqual(creationResponse))
  })

  it('should surface a rejected dispatch to the caller', async () => {
    mockAxiosRequest.mockRejectedValue(new Error('A service with this name already exists'))

    const { result } = renderHook(() => useCreateBlueprint(), { wrapper: createWrapper() })

    await act(async () => {
      await expect(result.current.mutateAsync({ environmentId: 'env-1', payload })).rejects.toThrow(
        'A service with this name already exists'
      )
    })
  })
})
