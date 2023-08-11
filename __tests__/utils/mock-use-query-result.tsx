import { QueryObserverSuccessResult } from '@tanstack/react-query'

export function mockUseQueryResult<T>(
  data: T,
  options?: Partial<Omit<QueryObserverSuccessResult<T, Error>, 'data'>>
): QueryObserverSuccessResult<T, Error> {
  return {
    dataUpdatedAt: 0,
    isFetching: false,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    isFetched: true,
    failureCount: 0,
    isFetchedAfterMount: true,
    isPreviousData: false,
    isStale: false,
    isPlaceholderData: false,
    remove: jest.fn(),
    isRefetching: false,
    refetch: jest.fn(),
    error: null,
    isError: false,
    isIdle: false,
    isLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    status: 'success',
    ...options,
    data: data,
  }
}
