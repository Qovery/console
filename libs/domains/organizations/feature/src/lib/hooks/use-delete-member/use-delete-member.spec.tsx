import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useDeleteMember } from './use-delete-member'

const mockAxiosRequest = jest.spyOn(axios, 'request')

const organizationId = 'org-1'
const members = [
  { id: 'user-1', name: 'Alice', email: 'alice@qovery.com', created_at: '2026-09-15T10:00:00Z' },
  { id: 'user-2', name: 'Bob', email: 'bob@qovery.com', created_at: '2026-09-15T10:00:00Z' },
]

function renderHooks({ updatedAt }: { updatedAt?: number } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 }, mutations: { retry: false } },
  })
  queryClient.setQueryData(queries.organizations.members({ organizationId }).queryKey, members, { updatedAt })

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const { result: mutationResult } = renderHook(() => useDeleteMember(), { wrapper })
  const { result: queryResult } = renderHook(() => useQuery({ ...queries.organizations.members({ organizationId }) }), {
    wrapper,
  })

  return { mutationResult, queryResult }
}

describe('useDeleteMember', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Any GET returns the stale list, as the backend does right after a deletion.
    mockAxiosRequest.mockImplementation(async (config) =>
      config?.method === 'GET' ? { data: { results: members } } : { data: undefined }
    )
  })

  it('should remove the deleted member from the members cache without refetching the stale list', async () => {
    const { mutationResult, queryResult } = renderHooks()

    await act(async () => {
      await mutationResult.current.mutateAsync({ organizationId, userId: 'user-1' })
    })

    await waitFor(() => expect(queryResult.current.data).toEqual([members[1]]))
    expect(mockAxiosRequest).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'GET' }))
  })

  it('should not let an in-flight members fetch overwrite the cache with the stale list', async () => {
    let resolveGet: (value: { data: { results: typeof members } }) => void = () => undefined
    mockAxiosRequest.mockImplementation((config) =>
      config?.method === 'GET'
        ? new Promise((resolve) => {
            resolveGet = resolve
          })
        : Promise.resolve({ data: undefined })
    )

    // Seed an already stale entry so mounting the query starts a background fetch.
    const { mutationResult, queryResult } = renderHooks({ updatedAt: 0 })
    await waitFor(() => expect(queryResult.current.isFetching).toBe(true))

    await act(async () => {
      await mutationResult.current.mutateAsync({ organizationId, userId: 'user-1' })
    })

    await act(async () => {
      resolveGet({ data: { results: members } })
    })

    await waitFor(() => expect(queryResult.current.isFetching).toBe(false))
    expect(queryResult.current.data).toEqual([members[1]])
  })
})
