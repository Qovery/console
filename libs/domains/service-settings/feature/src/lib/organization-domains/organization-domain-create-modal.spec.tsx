import { useQuery } from '@tanstack/react-query'
import { AxiosError, AxiosHeaders } from 'axios'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { OrganizationDomainCreateModal } from './organization-domain-create-modal'

const mockCreate = jest.fn()
const mockValidate = jest.fn()
let mockCanShare = true
let mockLinks = [{ internal_port: 3000, is_default: true }]
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))
jest.mock('@tanstack/react-query', () => ({ ...jest.requireActual('@tanstack/react-query'), useQuery: jest.fn() }))
jest.mock('@qovery/domains/custom-domains/data-access', () => ({
  ...jest.requireActual('@qovery/domains/custom-domains/data-access'),
  mutations: { validateEnvironmentCustomDomain: (...args: unknown[]) => mockValidate(...args) },
}))
jest.mock('@qovery/domains/custom-domains/feature', () => ({
  useCreateEnvironmentCustomDomain: () => ({ mutateAsync: mockCreate, isLoading: false }),
}))
jest.mock('@qovery/domains/services/feature', () => ({
  useLinks: ({ serviceId }: { serviceId: string }) => ({ data: serviceId ? mockLinks : [], isLoading: !serviceId }),
}))

const onClose = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  mockCanShare = true
  mockLinks = [{ internal_port: 3000, is_default: true }]
  mockValidate.mockResolvedValue([])
  mockCreate.mockResolvedValue({ domain: 'learn.acme.com', impacted_services: [] })
  jest.mocked(useQuery).mockImplementation((options: unknown) => {
    const { queryKey, select, enabled } = options as {
      queryKey: unknown[]
      select?: (data: unknown) => unknown
      enabled?: boolean
    }
    const data = (() => {
      if (enabled === false) return undefined
      if (queryKey[0] === 'projects') return [{ id: 'project-1', name: 'zipline' }]
      if (queryKey[0] === 'environments')
        return [{ id: 'env-1', name: 'production', routing_capabilities: { can_share: mockCanShare } }]
      if (queryKey[0] === 'services')
        return [
          { id: 'anycable', name: 'anycable', serviceType: 'APPLICATION' },
          { id: 'web', name: 'web', serviceType: 'CONTAINER' },
          { id: 'db', name: 'db', serviceType: 'DATABASE' },
        ]
      if (queryKey[0] === 'customDomains') return 'z8f3a91c2-gtw.qovery.dev'
      return undefined
    })()
    return { data: select ? select(data) : data, isLoading: false } as ReturnType<typeof useQuery>
  })
})

const addRoute = async (service: string, { first = true } = {}) => {
  await screen.findByRole('heading', { name: 'Add route' })
  if (first) {
    await selectEvent.select(screen.getByLabelText('Project'), 'zipline', { container: document.body })
    await selectEvent.select(screen.getByLabelText('Environment'), 'production', { container: document.body })
  }
  await selectEvent.select(screen.getByLabelText('Service'), service, { container: document.body })
}

it('requires a domain and at least one route before creating', async () => {
  const { userEvent } = renderWithProviders(<OrganizationDomainCreateModal onClose={onClose} />)
  expect(screen.getByRole('heading', { name: 'Add custom domain' })).toBeInTheDocument()
  expect(screen.getByText('No route added')).toBeInTheDocument()
  expect(screen.getAllByText('Add a route to get the target')).toHaveLength(2)
  await userEvent.type(screen.getByLabelText('Domain'), 'learn.acme.com')
  expect(screen.getByText('learn.acme.com CNAME')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
})

it('refuses a domain name the API would reject', async () => {
  const { userEvent } = renderWithProviders(<OrganizationDomainCreateModal onClose={onClose} />)
  await userEvent.type(screen.getByLabelText('Domain'), 'rmnbrd-test-01')
  expect(screen.queryByText('Enter a full domain name, such as app.example.com.')).not.toBeInTheDocument()
  await userEvent.tab()
  expect(await screen.findByText('Enter a full domain name, such as app.example.com.')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await addRoute('anycable')
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await screen.findByText('Service: zipline/production/anycable')
  // An invalid domain is not sent to the route pre-check, and cannot be created.
  expect(mockValidate).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()

  await userEvent.clear(screen.getByLabelText('Domain'))
  await userEvent.type(screen.getByLabelText('Domain'), 'test-01.example.com')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled())
})

it('adds a route, shows the environment CNAME target and creates the domain on its services', async () => {
  const { userEvent } = renderWithProviders(<OrganizationDomainCreateModal onClose={onClose} />)
  await userEvent.type(screen.getByLabelText('Domain'), 'learn.acme.com')
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await addRoute('anycable')
  expect(screen.getByText('Requests to / go to port 3000 of anycable.')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))

  expect(await screen.findByText('Service: zipline/production/anycable')).toBeInTheDocument()
  expect(screen.getByText('Port: 3000')).toBeInTheDocument()
  expect(screen.getAllByText('z8f3a91c2-gtw.qovery.dev')).toHaveLength(2)
  expect(mockValidate).toHaveBeenCalledWith({
    environmentId: 'env-1',
    payload: expect.objectContaining({
      domain: 'learn.acme.com',
      services: [{ id: 'anycable', type: 'APPLICATION' }],
    }),
  })

  // Later routes stay in the same environment.
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await screen.findByRole('heading', { name: 'Add route' })
  expect(screen.getByLabelText('Project')).toBeDisabled()
  await addRoute('web', { first: false })
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await screen.findByText('Service: zipline/production/web')

  await userEvent.click(screen.getByRole('button', { name: 'Create' }))
  await waitFor(() =>
    expect(mockCreate).toHaveBeenCalledWith({
      environmentId: 'env-1',
      payload: {
        domain: 'learn.acme.com',
        use_cdn: false,
        generate_certificate: true,
        services: [
          { id: 'anycable', type: 'APPLICATION' },
          { id: 'web', type: 'CONTAINER' },
        ],
      },
    })
  )
  expect(onClose).toHaveBeenCalled()
})

it('blocks a route that conflicts with an existing domain', async () => {
  mockValidate.mockResolvedValue([{ service_id: 'anycable', message: '/ already goes to anycable on this domain.' }])
  const { userEvent } = renderWithProviders(<OrganizationDomainCreateModal onClose={onClose} />)
  await userEvent.type(screen.getByLabelText('Domain'), 'learn.acme.com')
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await addRoute('anycable')
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  expect(await screen.findByText('/ already goes to anycable on this domain.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Add route' })).toBeDisabled()
})

it('refuses services without a public port', async () => {
  mockLinks = []
  const { userEvent } = renderWithProviders(<OrganizationDomainCreateModal onClose={onClose} />)
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await addRoute('anycable')
  expect(screen.getByText('Configure a public port on this service before adding a domain.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Add route' })).toBeDisabled()
})

it('removes routes and only allows one service when the environment cannot share domains', async () => {
  mockCanShare = false
  const { userEvent } = renderWithProviders(<OrganizationDomainCreateModal onClose={onClose} />)
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await addRoute('anycable')
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await screen.findByText('Service: zipline/production/anycable')
  expect(screen.getByRole('button', { name: 'Add route' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Remove route / of anycable' }))
  expect(screen.getByText('No route added')).toBeInTheDocument()
})

it('shows the API message when the creation fails without conflicts', async () => {
  mockCreate.mockRejectedValue(
    new AxiosError('Bad Request', '400', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: { detail: 'The environment is being deleted.' },
    })
  )
  const { userEvent } = renderWithProviders(<OrganizationDomainCreateModal onClose={onClose} />)
  await userEvent.type(screen.getByLabelText('Domain'), 'learn.acme.com')
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await addRoute('anycable')
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Create' }))
  expect(await screen.findByText('The environment is being deleted.')).toBeInTheDocument()
})

it('shows creation conflicts on the route they concern and keeps the modal open', async () => {
  // The console's HTTP interceptor rejects with `{ message, response }`, not an AxiosError.
  mockCreate.mockRejectedValue({
    message: 'Conflict',
    response: {
      status: 400,
      data: { errors: [{ service_id: 'anycable', message: 'learn.acme.com is used in another environment.' }] },
    },
  })
  const { userEvent } = renderWithProviders(<OrganizationDomainCreateModal onClose={onClose} />)
  await userEvent.type(screen.getByLabelText('Domain'), 'learn.acme.com')
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await addRoute('anycable')
  await userEvent.click(screen.getByRole('button', { name: 'Add route' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Create' }))
  expect(await screen.findByText('learn.acme.com is used in another environment.')).toBeInTheDocument()
  expect(onClose).not.toHaveBeenCalled()
})
