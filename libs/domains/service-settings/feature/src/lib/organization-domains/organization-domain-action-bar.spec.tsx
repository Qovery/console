import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { toast } from '@qovery/shared/ui'
import { act, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { OrganizationDomainActionBar } from './organization-domain-action-bar'

const mockConfirm = jest.fn()
const mockFetch = jest.fn()
const mockBulkDelete = jest.fn()
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
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org' }),
}))
jest.mock('@qovery/domains/custom-domains/feature', () => ({
  useBulkDeleteOrganizationCustomDomains: () => ({ mutateAsync: mockBulkDelete, isLoading: false }),
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
  await waitFor(() =>
    expect(toast).toHaveBeenCalledWith('error', 'DNS records checked', '1 valid, 1 failing, 0 unavailable.')
  )
  expect(mockFetch).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})
it('reports failed DNS requests as unavailable', async () => {
  mockFetch.mockRejectedValue(new Error('offline'))
  const { userEvent } = renderWithProviders(
    <OrganizationDomainActionBar domains={domains} disabled={false} onUnselect={jest.fn()} onDeleted={jest.fn()} />
  )
  await userEvent.click(screen.getByRole('button', { name: 'Check DNS records' }))
  await waitFor(() =>
    expect(toast).toHaveBeenCalledWith('warning', 'DNS records checked', '0 valid, 0 failing, 2 unavailable.')
  )
})
it('deletes the selected domains in one request after confirmation', async () => {
  mockBulkDelete.mockResolvedValue([])
  const onDeleted = jest.fn()
  const { userEvent } = renderWithProviders(
    <OrganizationDomainActionBar domains={domains} disabled={false} onUnselect={jest.fn()} onDeleted={onDeleted} />
  )
  await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
  expect(mockBulkDelete).not.toHaveBeenCalled()
  await act(async () => {
    await mockConfirm.mock.calls[0][0].action()
  })
  expect(mockBulkDelete).toHaveBeenCalledWith({
    organizationId: 'org',
    domains: [
      { environment_id: 'env', domain: 'one.example.com' },
      { environment_id: 'env', domain: 'two.example.com' },
    ],
  })
  expect(onDeleted).toHaveBeenCalledWith(['env:one.example.com', 'env:two.example.com'])
})
it('keeps the selection and the confirmation open when nothing could be deleted', async () => {
  mockBulkDelete.mockRejectedValue(new Error('forbidden'))
  const onDeleted = jest.fn()
  const { userEvent } = renderWithProviders(
    <OrganizationDomainActionBar domains={domains} disabled={false} onUnselect={jest.fn()} onDeleted={onDeleted} />
  )
  await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
  await act(async () => {
    await expect(mockConfirm.mock.calls[0][0].action()).rejects.toThrow('forbidden')
  })
  expect(onDeleted).not.toHaveBeenCalled()
})
