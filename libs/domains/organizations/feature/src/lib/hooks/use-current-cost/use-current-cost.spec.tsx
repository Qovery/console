import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query'
import axios from 'axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { useCurrentCost } from './use-current-cost'

const mockAxiosRequest = jest.spyOn(axios, 'request')

// Shape the console auth interceptor rejects with (not an AxiosError)
const serializedErrorWithStatus = (status: number) => ({
  message: 'Not authorized to get organization current cost',
  name: 'Forbidden',
  code: status.toString(),
  response: { status },
})

describe('useCurrentCost', () => {
  let queryClient: QueryClient
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient()
  })

  it('does not retry nor refetch on remount when the member is forbidden', async () => {
    mockAxiosRequest.mockRejectedValue(serializedErrorWithStatus(403))

    const { result, unmount } = renderHook(() => useCurrentCost({ organizationId: 'org-1' }), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockAxiosRequest).toHaveBeenCalledTimes(1)

    unmount()
    const { result: remounted } = renderHook(() => useCurrentCost({ organizationId: 'org-1' }), { wrapper })

    expect(remounted.current.isError).toBe(true)
    expect(remounted.current.isFetching).toBe(false)

    act(() => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
    })

    expect(remounted.current.isFetching).toBe(false)
    expect(mockAxiosRequest).toHaveBeenCalledTimes(1)
  })

  it('does not refetch on remount when a refetch is forbidden after a successful load', async () => {
    mockAxiosRequest.mockResolvedValueOnce({ data: { plan: 'TEAM' } })

    const { result, unmount } = renderHook(() => useCurrentCost({ organizationId: 'org-1' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    mockAxiosRequest.mockRejectedValue(serializedErrorWithStatus(403))
    act(() => {
      result.current.refetch()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockAxiosRequest).toHaveBeenCalledTimes(2)

    unmount()
    const { result: remounted } = renderHook(() => useCurrentCost({ organizationId: 'org-1' }), { wrapper })

    expect(remounted.current.data).toEqual({ plan: 'TEAM' })
    expect(remounted.current.isFetching).toBe(false)
    expect(mockAxiosRequest).toHaveBeenCalledTimes(2)
  })

  it('retries then refetches other errors on window focus', async () => {
    mockAxiosRequest.mockRejectedValue(serializedErrorWithStatus(500))
    queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })

    const { result } = renderHook(() => useCurrentCost({ organizationId: 'org-1' }), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockAxiosRequest).toHaveBeenCalledTimes(3)

    act(() => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
    })

    await waitFor(() => expect(mockAxiosRequest).toHaveBeenCalledTimes(6))
  })

  it('refetches other errors on remount', async () => {
    mockAxiosRequest.mockRejectedValue(serializedErrorWithStatus(500))
    queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })

    const { result, unmount } = renderHook(() => useCurrentCost({ organizationId: 'org-1' }), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockAxiosRequest).toHaveBeenCalledTimes(3)

    unmount()
    renderHook(() => useCurrentCost({ organizationId: 'org-1' }), { wrapper })

    await waitFor(() => expect(mockAxiosRequest).toHaveBeenCalledTimes(6))
  })
})
