import { useQuery } from '@tanstack/react-query'
import { AxiosError, type AxiosResponse } from 'axios'
import { renderHook } from '@qovery/shared/util-tests'
import { useClusterOperatorBootstrap } from './use-cluster-operator-bootstrap'

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

const mockUseQuery = useQuery as jest.Mock

const httpError = (status: number) =>
  new AxiosError('Request failed', undefined, undefined, undefined, { status } as AxiosResponse)

describe('useClusterOperatorBootstrap', () => {
  it('never keeps the bootstrap values in the cache', () => {
    renderHook(() => useClusterOperatorBootstrap({ organizationId: 'org-123', clusterId: 'cluster-123' }))

    expect(mockUseQuery.mock.calls.at(-1)[0].cacheTime).toBe(0)
  })

  it('retries server and network failures only', () => {
    renderHook(() => useClusterOperatorBootstrap({ organizationId: 'org-123', clusterId: 'cluster-123' }))

    const { retry } = mockUseQuery.mock.calls.at(-1)[0]
    expect(retry(0, httpError(403))).toBe(false)
    expect(retry(0, httpError(404))).toBe(false)
    expect(retry(0, httpError(500))).toBe(true)
    expect(retry(0, new Error('Network Error'))).toBe(true)
    expect(retry(3, httpError(500))).toBe(false)
  })
})
