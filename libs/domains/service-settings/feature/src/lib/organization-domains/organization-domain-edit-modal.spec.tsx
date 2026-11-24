import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { OrganizationDomainEditModal } from './organization-domain-edit-modal'

const mockEdit = jest.fn()
const loadedServiceDomains = [
  { isLoading: false, data: [{ id: 'domain-web', validation_domain: 'z1-gtw.qovery.dev' }] },
  { isLoading: false, data: [{ id: 'domain-api', validation_domain: 'z1-gtw.qovery.dev' }] },
]
let mockServiceDomains: { isLoading: boolean; data?: { id: string; validation_domain: string }[] }[] =
  loadedServiceDomains
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueries: () => mockServiceDomains,
}))
jest.mock('@qovery/domains/custom-domains/feature', () => ({
  useEditOrganizationCustomDomain: () => ({ mutateAsync: mockEdit, isLoading: false }),
}))

const domain: OrganizationCustomDomainResponse = {
  domain: 'app.example.com',
  environment_id: 'env',
  project: { id: 'project', name: 'zipline' },
  environment: { id: 'env', name: 'production', routing_mode: 'PER_HOSTNAME_LISTENER_SET' },
  generate_certificate: true,
  use_cdn: false,
  routes: [
    {
      id: 'route-root',
      custom_domain_id: 'domain-web',
      service: { id: 'web', name: 'web', type: 'APPLICATION' },
      port: { id: 'port-1', name: 'p3000', internal_port: 3000 },
      path: '/',
      path_rewrite: null,
    },
    {
      id: 'route-cable',
      custom_domain_id: 'domain-web',
      service: { id: 'web', name: 'web', type: 'APPLICATION' },
      port: { id: 'port-1', name: 'p3000', internal_port: 3000 },
      path: '/cable',
      path_rewrite: null,
    },
    {
      id: 'route-api',
      custom_domain_id: 'domain-api',
      service: { id: 'api', name: 'api', type: 'CONTAINER' },
      port: null,
      path: '/api',
      path_rewrite: null,
    },
  ],
}

const onClose = jest.fn()
beforeEach(() => {
  jest.clearAllMocks()
  mockServiceDomains = loadedServiceDomains
  mockEdit.mockResolvedValue(undefined)
})

it('shows the domain configuration, CNAME records and routes', () => {
  renderWithProviders(<OrganizationDomainEditModal domain={domain} onClose={onClose} />)
  expect(screen.getByRole('heading', { name: 'Edit custom domain' })).toBeInTheDocument()
  expect(screen.getByLabelText('Domain')).toHaveValue('app.example.com')
  expect(screen.getByText('app.example.com CNAME')).toBeInTheDocument()
  expect(screen.getByText('*.app.example.com CNAME')).toBeInTheDocument()
  expect(screen.getAllByText('z1-gtw.qovery.dev')).toHaveLength(2)
  expect(screen.getByRole('switch', { name: 'Generate certificate' })).toBeChecked()
  expect(screen.getByRole('switch', { name: 'Domain behind a CDN or DNS proxy' })).not.toBeChecked()
  expect(screen.getByText('/cable')).toBeInTheDocument()
  expect(screen.getAllByText('Service: zipline/production/web')).toHaveLength(2)
  expect(screen.getByText('Port: none')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
})

it('keeps the CNAME layout while the target loads', () => {
  mockServiceDomains = [{ isLoading: true }, { isLoading: true }]
  renderWithProviders(<OrganizationDomainEditModal domain={domain} onClose={onClose} />)
  expect(screen.getByText('CNAME configuration')).toBeInTheDocument()
  expect(screen.getByText('app.example.com CNAME')).toBeInTheDocument()
  expect(screen.getByText('*.app.example.com CNAME')).toBeInTheDocument()
  expect(screen.queryByText('z1-gtw.qovery.dev')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument()
})

it('saves the settings on every service without redeploying', async () => {
  const { userEvent } = renderWithProviders(<OrganizationDomainEditModal domain={domain} onClose={onClose} />)
  await userEvent.click(screen.getByRole('switch', { name: 'Domain behind a CDN or DNS proxy' }))
  expect(screen.getByRole('switch', { name: 'Generate certificate' })).not.toBeChecked()
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() =>
    expect(mockEdit).toHaveBeenCalledWith({
      payload: { domain: 'app.example.com', use_cdn: true, generate_certificate: false },
      redeploy: false,
      targets: [
        { serviceId: 'web', serviceType: 'APPLICATION', customDomainId: 'domain-web' },
        { serviceId: 'api', serviceType: 'CONTAINER', customDomainId: 'domain-api' },
      ],
      removedTargets: [],
    })
  )
  expect(onClose).toHaveBeenCalled()
})

it('removes every route of a service and redeploys', async () => {
  const { userEvent } = renderWithProviders(<OrganizationDomainEditModal domain={domain} onClose={onClose} />)
  await userEvent.click(screen.getByRole('button', { name: 'Remove route /cable of web' }))
  expect(screen.getByRole('button', { name: 'Keep route / of web' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Save and redeploy' }))
  await waitFor(() =>
    expect(mockEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        redeploy: true,
        targets: [{ serviceId: 'api', serviceType: 'CONTAINER', customDomainId: 'domain-api' }],
        removedTargets: [{ serviceId: 'web', serviceType: 'APPLICATION', customDomainId: 'domain-web' }],
      })
    )
  )
})

it('warns when every route is removed and keeps the modal open on error', async () => {
  mockEdit.mockRejectedValue(new Error('boom'))
  const { userEvent } = renderWithProviders(<OrganizationDomainEditModal domain={domain} onClose={onClose} />)
  await userEvent.click(screen.getByRole('button', { name: 'Remove route / of web' }))
  await userEvent.click(screen.getByRole('button', { name: 'Remove route /api of api' }))
  expect(screen.getByText('Saving removes this domain from every service.')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mockEdit).toHaveBeenCalled())
  expect(onClose).not.toHaveBeenCalled()
})
