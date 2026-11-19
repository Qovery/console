import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/services/data-access'
import { act, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { OrganizationDomainActionBar } from './organization-domain-action-bar'

const mockConfirm = jest.fn()
const mockFetch = jest.fn()
const mockInvalidate = jest.fn()
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ fetchQuery: mockFetch, invalidateQueries: mockInvalidate }),
}))
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModalConfirmation: () => ({ openModalConfirmation: mockConfirm }),
  toast: jest.fn(),
}))
function domain(name: string, configId: string): OrganizationCustomDomainResponse {
  return {
    domain: name,
    environment_id: 'env',
    project: { id: 'project', name: 'Project' },
    environment: { id: 'env', name: 'production', routing_mode: 'PER_HOSTNAME_LISTENER_SET' },
    generate_certificate: true,
    use_cdn: false,
    routes: [
      {
        id: configId,
        custom_domain_id: configId,
        service: { id: 'service', name: 'web', type: 'APPLICATION' },
        port: null,
        path: '/',
        path_rewrite: null,
      },
    ],
  }
}
const domains = [domain('one.example.com', 'one'), domain('two.example.com', 'two')]
beforeEach(() => jest.clearAllMocks())
afterEach(() => jest.restoreAllMocks())

it('checks each service once across selected domains and reports results', async () => {
  mockFetch.mockResolvedValue([
    { domain_name: 'one.example.com', status: 'MATCHES_LOAD_BALANCER_HOST' },
    { domain_name: 'two.example.com', status: 'DOMAIN_LINKED_TO_WRONG_HOST', error_details: 'Wrong CNAME' },
  ])
  const { userEvent } = renderWithProviders(
    <OrganizationDomainActionBar domains={domains} disabled={false} onUnselect={jest.fn()} onDeleted={jest.fn()} />
  )
  await userEvent.click(screen.getByRole('button', { name: 'Check DNS records' }))
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 valid, 1 failing, 0 unavailable'))
  expect(mockFetch).toHaveBeenCalledTimes(1)
})
it('reports failed DNS requests as unavailable', async () => {
  mockFetch.mockRejectedValue(new Error('offline'))
  const { userEvent } = renderWithProviders(
    <OrganizationDomainActionBar domains={domains} disabled={false} onUnselect={jest.fn()} onDeleted={jest.fn()} />
  )
  await userEvent.click(screen.getByRole('button', { name: 'Check DNS records' }))
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('2 unavailable'))
})
it('requires confirmation, deduplicates routes, and retries only failed deletions', async () => {
  const remove = jest
    .spyOn(mutations, 'deleteCustomDomain')
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(undefined)
  const onDeleted = jest.fn()
  const repeatedRoutes = {
    ...domains[0],
    routes: [...domains[0].routes, { ...domains[0].routes[0], id: 'other-route', path: '/api' }],
  }
  const { userEvent } = renderWithProviders(
    <OrganizationDomainActionBar
      domains={[repeatedRoutes, domains[1]]}
      disabled={false}
      onUnselect={jest.fn()}
      onDeleted={onDeleted}
    />
  )
  await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
  expect(remove).not.toHaveBeenCalled()
  const action = mockConfirm.mock.calls[0][0].action
  await act(async () => {
    await expect(action()).rejects.toThrow('Some domain configurations')
  })
  expect(remove).toHaveBeenCalledTimes(2)
  expect(onDeleted).toHaveBeenCalledWith(['env:one.example.com'])
  await act(async () => {
    await action()
  })
  expect(remove).toHaveBeenCalledTimes(3)
  expect(remove).toHaveBeenLastCalledWith({ serviceId: 'service', serviceType: 'APPLICATION', customDomainId: 'two' })
  expect(mockInvalidate).toHaveBeenCalled()
})
