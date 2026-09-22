import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { LlmProviderType } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useCreateLlmProvider } from './use-create-llm-provider'

const mockAxiosRequest = jest.spyOn(axios, 'request')

const createdLlmProvider = {
  id: 'provider-1',
  name: 'My Bedrock',
  type: LlmProviderType.BEDROCK,
  has_credential: true,
  scope: 'USER',
  created_at: '2026-09-15T10:00:00Z',
  updated_at: '2026-09-15T10:00:00Z',
}

describe('useCreateLlmProvider', () => {
  // The background refetch triggered by invalidateQueries is held open on purpose: it
  // deliberately resolves an empty list, so the assertion below can only pass if the
  // synchronous cache update in `onSuccess` put the provider there first.
  let resolveRefetch: (value: { data: { results: unknown[] } }) => void

  beforeEach(() => {
    jest.clearAllMocks()
    mockAxiosRequest.mockImplementation(async (config) => {
      if (config?.method === 'GET') {
        return new Promise((resolve) => {
          resolveRefetch = resolve
        })
      }
      return { data: createdLlmProvider }
    })
  })

  it('should synchronously add the created provider to the llmProviders cache before the mutation resolves', async () => {
    const organizationId = 'org-1'
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    // Seed the cache the way useLlmProviders would have already populated it.
    queryClient.setQueryData(queries.organizations.llmProviders({ organizationId }).queryKey, [])

    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result: mutationResult } = renderHook(() => useCreateLlmProvider(), { wrapper })
    const { result: queryResult } = renderHook(
      () => useQuery({ ...queries.organizations.llmProviders({ organizationId }) }),
      { wrapper }
    )

    await act(async () => {
      await mutationResult.current.mutateAsync({
        organizationId,
        llmProviderRequest: { name: 'My Bedrock', type: LlmProviderType.BEDROCK, credential: 'aws-secret' },
      })
    })

    await waitFor(() => expect(queryResult.current.data).toEqual([createdLlmProvider]))

    await act(async () => {
      resolveRefetch({ data: { results: [] } })
    })
  })
})
