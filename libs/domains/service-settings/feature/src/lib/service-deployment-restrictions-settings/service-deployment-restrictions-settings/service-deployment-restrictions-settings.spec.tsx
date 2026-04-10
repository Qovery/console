import { type ReactNode } from 'react'
import { type Container } from '@qovery/domains/services/data-access'
import {
  applicationFactoryMock,
  containerFactoryMock,
  cronjobFactoryMock,
  helmFactoryMock,
  terraformFactoryMock,
} from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceDeploymentRestrictionsSettings } from './service-deployment-restrictions-settings'

const mockDeleteRestriction = jest.fn()
const mockOpenModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()

const mockJob = cronjobFactoryMock(1)[0]
let mockService = mockJob
let mockDeploymentRestrictions = [
  {
    id: 'restriction-1',
    mode: 'MATCH',
    type: 'PATH',
    value: 'src/jobs',
    created_at: '2020-01-01T00:00:00Z',
  },
]
let mockIsLoadingDeploymentRestrictions = false

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    environmentId: 'env-1',
    serviceId: 'service-1',
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => ({
    data: mockService,
  }),
  useDeploymentRestrictions: () => ({
    data: mockDeploymentRestrictions,
    isLoading: mockIsLoadingDeploymentRestrictions,
  }),
  useDeleteDeploymentRestriction: () => ({
    mutate: mockDeleteRestriction,
  }),
}))

jest.mock('../service-deployment-restrictions-modal/service-deployment-restrictions-modal', () => ({
  ServiceDeploymentRestrictionsModal: ({ deploymentRestriction }: { deploymentRestriction?: { value: string } }) => (
    <div>{deploymentRestriction?.value ?? 'new-restriction'}</div>
  ),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  LoaderSpinner: () => <div role="status" aria-label="Loading" />,
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe('ServiceDeploymentRestrictionsSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockService = cronjobFactoryMock(1)[0]
    mockDeploymentRestrictions = [
      {
        id: 'restriction-1',
        mode: 'MATCH',
        type: 'PATH',
        value: 'src/jobs',
        created_at: '2020-01-01T00:00:00Z',
      },
    ]
    mockIsLoadingDeploymentRestrictions = false
  })

  it('renders for job services', () => {
    renderWithProviders(<ServiceDeploymentRestrictionsSettings />)

    expect(screen.getByRole('heading', { level: 1, name: 'Deployment Restrictions' })).toBeInTheDocument()
    expect(screen.getByText('Deployment restrictions')).toBeInTheDocument()
    expect(screen.getByText('src/jobs')).toBeInTheDocument()
  })

  it('renders for application services', () => {
    mockService = applicationFactoryMock(1)[0]

    renderWithProviders(<ServiceDeploymentRestrictionsSettings />)

    expect(screen.getByRole('heading', { level: 1, name: 'Deployment Restrictions' })).toBeInTheDocument()
    expect(screen.getByText('src/jobs')).toBeInTheDocument()
  })

  it('renders for helm git source services', () => {
    mockService = helmFactoryMock(1)[0]

    renderWithProviders(<ServiceDeploymentRestrictionsSettings />)

    expect(screen.getByRole('heading', { level: 1, name: 'Deployment Restrictions' })).toBeInTheDocument()
    expect(screen.getByText('src/jobs')).toBeInTheDocument()
  })

  it('renders for terraform services', () => {
    mockService = terraformFactoryMock(1)[0]

    renderWithProviders(<ServiceDeploymentRestrictionsSettings />)

    expect(screen.getByRole('heading', { level: 1, name: 'Deployment Restrictions' })).toBeInTheDocument()
    expect(screen.getByText('src/jobs')).toBeInTheDocument()
  })

  it('does not render for unsupported service types', () => {
    mockService = containerFactoryMock(1)[0] as Container

    renderWithProviders(<ServiceDeploymentRestrictionsSettings />)

    expect(screen.queryByText('Deployment Restrictions')).not.toBeInTheDocument()
  })

  it('shows a spinner while loading restrictions', () => {
    mockIsLoadingDeploymentRestrictions = true

    renderWithProviders(<ServiceDeploymentRestrictionsSettings />)

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('shows the empty state when no restriction exists', () => {
    mockDeploymentRestrictions = []

    renderWithProviders(<ServiceDeploymentRestrictionsSettings />)

    expect(screen.getByText('No deployment restrictions are set')).toBeInTheDocument()
  })

  it('opens the add modal', async () => {
    const { userEvent } = renderWithProviders(<ServiceDeploymentRestrictionsSettings />)

    await userEvent.click(screen.getByRole('button', { name: /new restriction/i }))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
  })

  it('opens the edit modal', async () => {
    const { userEvent } = renderWithProviders(<ServiceDeploymentRestrictionsSettings />)

    await userEvent.click(screen.getByRole('button', { name: 'Edit restriction' }))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
  })

  it('opens the delete confirmation and removes the restriction', async () => {
    const { userEvent } = renderWithProviders(<ServiceDeploymentRestrictionsSettings />)

    await userEvent.click(screen.getByRole('button', { name: 'Delete restriction' }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledTimes(1)

    mockOpenModalConfirmation.mock.calls[0][0].action()

    expect(mockDeleteRestriction).toHaveBeenCalledWith({
      serviceId: 'service-1',
      serviceType: 'JOB',
      deploymentRestrictionId: 'restriction-1',
    })
  })
})
