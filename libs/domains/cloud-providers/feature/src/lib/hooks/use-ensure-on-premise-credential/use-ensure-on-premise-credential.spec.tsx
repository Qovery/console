import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios, { type AxiosRequestConfig } from 'axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook } from '@qovery/shared/util-tests'
import { useEnsureOnPremiseCredential } from './use-ensure-on-premise-credential'

const organizationId = 'org-123'
const existingCredential = { id: 'existing-credential', name: 'my-on-premise', object_type: 'OTHER' }
const createdCredential = { id: 'created-credential', name: 'On-premise clusters', object_type: 'OTHER' }

const isList = (config?: AxiosRequestConfig) => config?.method?.toUpperCase() === 'GET'

const setup = (request: (config?: AxiosRequestConfig) => Promise<unknown>) => {
  const requestSpy = jest.spyOn(axios, 'request').mockImplementation(request)
  // Like the console: a list read less than a minute ago is fresh for the queries.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => useEnsureOnPremiseCredential(), { wrapper })
  // `act` returns a thenable, not a promise: make it one for `resolves` and `rejects`.
  const ensure = async () => await act(() => result.current.mutateAsync({ organizationId }))
  const requests = () =>
    requestSpy.mock.calls.map(([config]) => ({
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
    }))

  return { ensure, requests }
}

describe('useEnsureOnPremiseCredential', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('uses an on-premise credential of the organization when there is one', async () => {
    const { ensure, requests } = setup(async () => ({ data: { results: [existingCredential] } }))

    await expect(ensure()).resolves.toEqual(existingCredential)

    expect(requests()).toEqual([
      {
        method: 'GET',
        url: expect.stringMatching(/\/organization\/org-123\/onPremise\/credentials$/),
        data: undefined,
      },
    ])
  })

  it('creates the on-premise credential when the organization has none', async () => {
    const { ensure, requests } = setup(async (config) =>
      isList(config) ? { data: { results: [] } } : { data: createdCredential }
    )

    await expect(ensure()).resolves.toEqual(createdCredential)

    expect(requests()).toEqual([
      expect.objectContaining({ method: 'GET' }),
      {
        method: 'POST',
        url: expect.stringMatching(/\/organization\/org-123\/onPremise\/credentials$/),
        data: JSON.stringify({ name: 'On-premise clusters' }),
      },
    ])
  })

  it('does not create a second credential on a retry', async () => {
    let credentials: (typeof createdCredential)[] = []
    const { ensure, requests } = setup(async (config) => {
      if (isList(config)) return { data: { results: credentials } }
      credentials = [createdCredential]
      return { data: createdCredential }
    })

    await ensure()
    await expect(ensure()).resolves.toEqual(createdCredential)

    expect(requests().map(({ method }) => method)).toEqual(['GET', 'POST', 'GET'])
  })

  it('finds on a retry a credential created by a request that failed', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    let credentials: (typeof createdCredential)[] = []
    const { ensure, requests } = setup(async (config) => {
      if (isList(config)) return { data: { results: credentials } }
      credentials = [createdCredential]
      throw new Error('Gateway timeout')
    })

    await expect(ensure()).rejects.toThrow('Gateway timeout')
    await expect(ensure()).resolves.toEqual(createdCredential)

    expect(requests().map(({ method }) => method)).toEqual(['GET', 'POST', 'GET'])
  })

  it('creates nothing when the credentials cannot be listed', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const { ensure, requests } = setup(async () => {
      throw new Error('Service unavailable')
    })

    await expect(ensure()).rejects.toThrow('Service unavailable')

    expect(requests().map(({ method }) => method)).toEqual(['GET'])
  })
})
