import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { type PropsWithChildren } from 'react'
import { useServicesForDeploy } from './use-services-for-deploy'

// Mock the queries module
jest.mock('@qovery/state/util-queries', () => ({
  queries: {
    services: {
      list: jest.fn(() => ({
        queryKey: ['services', 'list', 'env-1'],
        queryFn: jest.fn(),
      })),
    },
  },
}))

describe('useServicesForDeploy', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    return ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  it('should return empty array when no environmentId', () => {
    const { result } = renderHook(() => useServicesForDeploy({ environmentId: '' }), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toEqual([])
  })

  it('should return isLoading state', () => {
    const { result } = renderHook(() => useServicesForDeploy({ environmentId: 'env-1' }), {
      wrapper: createWrapper(),
    })

    // Initially should be loading or have data
    expect(typeof result.current.isLoading).toBe('boolean')
  })
})
