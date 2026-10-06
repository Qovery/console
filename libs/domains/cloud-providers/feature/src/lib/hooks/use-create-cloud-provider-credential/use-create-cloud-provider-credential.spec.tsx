import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import posthog from 'posthog-js'
import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { useCreateCloudProviderCredential } from './use-create-cloud-provider-credential'

jest.mock('posthog-js', () => ({ capture: jest.fn() }))
const mockRequest = jest.spyOn(axios, 'request')
const request = {
  organizationId: 'fixture-org',
  cloudProvider: 'AWS' as const,
  payload: {
    type: 'AWS_STATIC' as const,
    name: 'fixture-name',
    access_key_id: 'fixture-key',
    secret_access_key: 'fixture-secret',
  },
}
const response = { id: 'fixture-access', name: 'fixture-response-name' }

function wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
let queryClient: QueryClient

describe('useCreateCloudProviderCredential analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      logger: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
    })
  })
  afterEach(() => queryClient.clear())

  it('captures only safe properties after API success, never on rerender', async () => {
    let resolveRequest!: (value: { data: typeof response }) => void
    mockRequest.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        })
    )
    const { result, rerender } = renderHook(() => useCreateCloudProviderCredential(), { wrapper })
    let pending!: Promise<unknown>
    act(() => {
      pending = result.current.mutateAsync(request)
    })
    await waitFor(() => expect(mockRequest).toHaveBeenCalledTimes(1))
    expect(posthog.capture).not.toHaveBeenCalled()
    await act(async () => {
      resolveRequest({ data: response })
      await pending
    })
    expect(posthog.capture).toHaveBeenCalledTimes(1)
    expect(posthog.capture).toHaveBeenCalledWith('cloud-credentials-created', {
      organization_id: 'fixture-org',
      cloud_provider: 'AWS',
      $groups: { organization_id: 'fixture-org' },
    })
    rerender()
    expect(posthog.capture).toHaveBeenCalledTimes(1)
    expect(JSON.stringify((posthog.capture as jest.Mock).mock.calls)).not.toMatch(
      /fixture-secret|fixture-key|fixture-name|fixture-description|fixture-access|fixture-response-name/
    )
  })

  it('does not report creation when the API rejects', async () => {
    const error = new Error('fixture-failure')
    mockRequest.mockRejectedValueOnce(error)
    const { result } = renderHook(() => useCreateCloudProviderCredential(), { wrapper })
    await act(async () => {
      await expect(result.current.mutateAsync(request)).rejects.toBe(error)
    })
    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it('reports one success after a failed request is retried', async () => {
    const error = new Error('fixture-failure')
    mockRequest.mockRejectedValueOnce(error).mockResolvedValueOnce({ data: response })
    const { result } = renderHook(() => useCreateCloudProviderCredential(), { wrapper })
    await act(async () => {
      await expect(result.current.mutateAsync(request)).rejects.toBe(error)
    })
    await act(async () => {
      await result.current.mutateAsync(request)
    })
    expect(mockRequest).toHaveBeenCalledTimes(2)
    expect(posthog.capture).toHaveBeenCalledTimes(1)
  })

  it('does not report credentials for the on-premise path without an API creation', async () => {
    const { result } = renderHook(() => useCreateCloudProviderCredential(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({
        organizationId: 'fixture-org',
        cloudProvider: 'ON_PREMISE',
        payload: undefined,
      })
    })
    expect(mockRequest).not.toHaveBeenCalled()
    expect(posthog.capture).not.toHaveBeenCalled()
  })
})
