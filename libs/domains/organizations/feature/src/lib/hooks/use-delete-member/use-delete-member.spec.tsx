import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useDeleteMember } from './use-delete-member'

const mockAxiosRequest = jest.spyOn(axios, 'request')

const members = [
  { id: 'user-1', name: 'Alice', email: 'alice@qovery.com', created_at: '2026-09-15T10:00:00Z' },
  { id: 'user-2', name: 'Bob', email: 'bob@qovery.com', created_at: '2026-09-15T10:00:00Z' },
]

describe('useDeleteMember', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Any GET returns the stale list, as the backend does right after a deletion.
    mockAxiosRequest.mockImplementation(async (config) =>
      config?.method === 'GET' ? { data: { results: members } } : { data: undefined }
    )
  })

  it('should remove the deleted member from the members cache without refetching the stale list', async () => {
    const organizationId = 'org-1'
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 60_000 }, mutations: { retry: false } },
    })
    queryClient.setQueryData(queries.organizations.members({ organizationId }).queryKey, members)

    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result: mutationResult } = renderHook(() => useDeleteMember(), { wrapper })
    const { result: queryResult } = renderHook(
      () => useQuery({ ...queries.organizations.members({ organizationId }) }),
      { wrapper }
    )

    await act(async () => {
      await mutationResult.current.mutateAsync({ organizationId, userId: 'user-1' })
    })

    await waitFor(() => expect(queryResult.current.data).toEqual([members[1]]))
    expect(mockAxiosRequest).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'GET' }))
  })
})
