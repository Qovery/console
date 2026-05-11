import { type ReactNode } from 'react'
import { type Database } from '@qovery/domains/services/data-access'
import { applicationFactoryMock, databaseFactoryMock, helmFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceDomainSettings } from './service-domain-settings'

const mockRefetchCheckCustomDomains = jest.fn()
const mockDeleteCustomDomain = jest.fn()
const mockOpenModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()

const mockApplication = applicationFactoryMock(1)[0]
const mockHelm = helmFactoryMock(1)[0]
let mockService = mockApplication
let mockCustomDomains = [
  {
    id: '1',
    domain: 'example.com',
    status: 'VALIDATION_PENDING',
    validation_domain: 'validation.example.com',
    updated_at: '2020-01-01T00:00:00Z',
    created_at: '2020-01-01T00:00:00Z',
  },
]
let mockCheckedCustomDomains: Array<{ domain_name: string; error_details?: string }> = []
let mockLinks = [{ url: 'https://default.qovery.example', is_qovery_domain: true, is_default: true }]
let mockIsLoadingCustomDomains = false
let mockIsFetchingCheckedCustomDomains = false

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'project-1',
    environmentId: 'env-1',
    serviceId: 'service-1',
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => ({
    data: mockService,
  }),
  useCheckCustomDomains: () => ({
    data: mockCheckedCustomDomains,
    refetch: mockRefetchCheckCustomDomains,
    isFetching: mockIsFetchingCheckedCustomDomains,
  }),
  useLinks: () => ({
    data: mockLinks,
    isLoading: false,
  }),
}))

jest.mock('@qovery/domains/custom-domains/feature', () => ({
  useCustomDomains: () => ({
    data: mockCustomDomains,
    isLoading: mockIsLoadingCustomDomains,
  }),
  useDeleteCustomDomain: () => ({
    mutate: mockDeleteCustomDomain,
  }),
}))

jest.mock('../service-domain-crud-modal/service-domain-crud-modal', () => ({
  ServiceDomainCrudModal: ({ customDomain }: { customDomain?: { domain: string } }) => (
    <div data-testid="service-domain-crud-modal">{customDomain?.domain ?? 'new-domain'}</div>
  ),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Link: ({ children, to: _to, params: _params, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
}))

describe('ServiceDomainSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockService = mockApplication
    mockCustomDomains = [
      {
        id: '1',
        domain: 'example.com',
        status: 'VALIDATION_PENDING',
        validation_domain: 'validation.example.com',
        updated_at: '2020-01-01T00:00:00Z',
        created_at: '2020-01-01T00:00:00Z',
      },
    ]
    mockCheckedCustomDomains = []
    mockLinks = [{ url: 'https://default.qovery.example', is_qovery_domain: true, is_default: true }]
    mockIsLoadingCustomDomains = false
    mockIsFetchingCheckedCustomDomains = false
  })

  it('renders for application services', () => {
    renderWithProviders(<ServiceDomainSettings />)

    expect(screen.getByRole('heading', { level: 1, name: 'Domain' })).toBeInTheDocument()
    expect(screen.getByText('Configured domains')).toBeInTheDocument()
    expect(screen.getByText('example.com')).toBeInTheDocument()
  })

  it('renders for helm services', () => {
    mockService = mockHelm

    renderWithProviders(<ServiceDomainSettings />)

    expect(screen.getByRole('heading', { level: 1, name: 'Domain' })).toBeInTheDocument()
  })

  it('does not render for unsupported service types', () => {
    mockService = databaseFactoryMock(1)[0] as Database

    renderWithProviders(<ServiceDomainSettings />)

    expect(screen.queryByText('Domain')).not.toBeInTheDocument()
  })

  it('shows a spinner while loading domains', () => {
    mockCustomDomains = []
    mockIsLoadingCustomDomains = true

    renderWithProviders(<ServiceDomainSettings />)

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('shows the callout when a checked domain is in error', () => {
    mockCheckedCustomDomains = [{ domain_name: 'example.com', error_details: 'Misconfigured' }]

    renderWithProviders(<ServiceDomainSettings />)

    expect(screen.getByText('Some domains are in error. Please check the status below.')).toBeInTheDocument()
  })

  it('shows the application empty state when no public port exists', () => {
    mockCustomDomains = []
    mockLinks = []

    renderWithProviders(<ServiceDomainSettings />)

    expect(screen.getByText('Create public port')).toBeInTheDocument()
  })

  it('shows the helm empty state when no public networking exists', () => {
    mockService = mockHelm
    mockCustomDomains = []
    mockLinks = []

    renderWithProviders(<ServiceDomainSettings />)

    expect(screen.getByText('Create public networking')).toBeInTheDocument()
  })

  it('opens the add modal', async () => {
    const { userEvent } = renderWithProviders(<ServiceDomainSettings />)

    await userEvent.click(screen.getByRole('button', { name: 'Add Domain' }))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
  })

  it('opens the edit modal', async () => {
    const { userEvent } = renderWithProviders(<ServiceDomainSettings />)

    await userEvent.click(screen.getByTestId('edit-button'))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
  })

  it('opens the delete confirmation', async () => {
    const { userEvent } = renderWithProviders(<ServiceDomainSettings />)

    await userEvent.click(screen.getByTestId('delete-button'))

    expect(mockOpenModalConfirmation).toHaveBeenCalledTimes(1)
  })

  it('triggers domain recheck', async () => {
    const { userEvent } = renderWithProviders(<ServiceDomainSettings />)

    await userEvent.click(screen.getByTestId('recheck-button'))

    expect(mockRefetchCheckCustomDomains).toHaveBeenCalledTimes(1)
  })
})
