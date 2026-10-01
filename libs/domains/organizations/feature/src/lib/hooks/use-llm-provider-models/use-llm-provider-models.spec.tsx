import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { type PropsWithChildren } from 'react'
import { renderHook, waitFor } from '@qovery/shared/util-tests'
import { useLlmProviderModels } from './use-llm-provider-models'

const mockAxiosRequest = jest.spyOn(axios, 'request')

describe('useLlmProviderModels', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAxiosRequest.mockResolvedValue({ data: { results: [] } })
  })

  it('loads models only after a token is selected', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { rerender } = renderHook(({ llmProviderId }) => useLlmProviderModels({ llmProviderId, enabled: true }), {
      initialProps: { llmProviderId: '' },
      wrapper,
    })

    expect(mockAxiosRequest).not.toHaveBeenCalled()

    rerender({ llmProviderId: 'provider-1' })

    await waitFor(() =>
      expect(mockAxiosRequest).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', url: 'https://api.qovery.com/llmProvider/provider-1/models' })
      )
    )
  })
})
