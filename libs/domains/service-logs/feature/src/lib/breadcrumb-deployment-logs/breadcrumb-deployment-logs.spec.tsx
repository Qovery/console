import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BreadcrumbDeploymentLogs, type BreadcrumbDeploymentLogsProps } from './breadcrumb-deployment-logs'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    organizationId: 'org-123',
    projectId: 'proj-456',
    environmentId: 'env-789',
  }),
}))

const mockProps: BreadcrumbDeploymentLogsProps = {
  serviceId: 'service-1',
  versionId: 'version-1',
  services: [
    { id: 'service-1', serviceType: 'APPLICATION', name: 'Service 1' },
    { id: 'service-2', serviceType: 'APPLICATION', name: 'Service 2' },
  ],
  statusStages: [
    {
      name: 'Stage 1',
      applications: [{ id: 'service-1', state: 'RUNNING', steps: { total_duration_sec: 120 } }],
      databases: [],
      containers: [],
      jobs: [],
      helms: [],
    },
    {
      name: 'Stage 2',
      applications: [],
      databases: [{ id: 'service-2', state: 'COMPLETED', steps: { total_duration_sec: 60 } }],
      containers: [],
      jobs: [],
      helms: [],
    },
  ],
}

describe('BreadcrumbDeploymentLogs', () => {
  it('renders correctly with given props', async () => {
    renderWithProviders(<BreadcrumbDeploymentLogs {...mockProps} />)
    expect(screen.getByText('Deployment logs')).toBeInTheDocument()
    expect(screen.getByText('Service 1')).toBeInTheDocument()
  })

  it('opens dropdown when button is clicked', async () => {
    const { userEvent } = renderWithProviders(<BreadcrumbDeploymentLogs {...mockProps} />)
    const button = screen.getByRole('button')
    await userEvent.click(button)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('displays "No result" message when search has no matches', async () => {
    const { userEvent } = renderWithProviders(<BreadcrumbDeploymentLogs {...mockProps} />)
    const button = screen.getByRole('button')
    await userEvent.click(button)

    const searchInput = screen.getByPlaceholderText('Search...')
    await userEvent.type(searchInput, 'Nonexistent Service')

    expect(screen.getByText('No result for this search')).toBeInTheDocument()
  })

  it('renders correct stage index for the current service', async () => {
    renderWithProviders(<BreadcrumbDeploymentLogs {...mockProps} />)
    const badgeElement = screen.getByText('1')
    expect(badgeElement).toBeInTheDocument()
  })
})
