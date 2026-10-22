import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useCreateCloudProviderCredential } from './use-create-cloud-provider-credential'

const organizationId = 'org-123'
const credential = { id: 'new-credential', name: 'New AWS credential', object_type: 'AWS_ROLE' }

it('makes the created credential selectable before the list refetch completes', async () => {
  let resolveRefetch: (value: unknown) => void = () => undefined
  const requestSpy = jest.spyOn(axios, 'request').mockImplementation(async (config) => {
    if (config?.method?.toUpperCase() === 'GET')
      return new Promise((resolve) => {
        resolveRefetch = resolve
      })
    return { data: credential }
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const credentialsQuery = queries.cloudProviders.credentials({ organizationId, cloudProvider: 'AWS' })
  queryClient.setQueryData(credentialsQuery.queryKey, [])
  const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result: mutation } = renderHook(() => useCreateCloudProviderCredential(), { wrapper })
  const { result: list } = renderHook(() => useQuery(credentialsQuery), { wrapper })
  await act(async () => {
    await mutation.current.mutateAsync({
      organizationId,
      cloudProvider: 'AWS',
      payload: { type: 'AWS_ROLE', name: 'New AWS credential', role_arn: 'arn:aws:iam::123456789012:role/test' },
    })
  })
  await waitFor(() => expect(list.current.data).toEqual([credential]))
  expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: credentialsQuery.queryKey })
  expect(invalidateSpy).toHaveBeenCalledWith({
    queryKey: queries.organizations.listCredentials({ organizationId }).queryKey,
  })
  await act(async () => resolveRefetch({ data: { results: [credential] } }))
  requestSpy.mockRestore()
  queryClient.clear()
})
