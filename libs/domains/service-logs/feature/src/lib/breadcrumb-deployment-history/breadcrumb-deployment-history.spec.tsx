import { useDeploymentHistory, useService } from '@qovery/domains/services/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BreadcrumbDeploymentHistory } from './breadcrumb-deployment-history'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    organizationId: 'org-123',
    projectId: 'proj-456',
    environmentId: 'env-789',
  }),
}))

jest.mock('@qovery/domains/services/feature')

const mockDeploymentHistory = [
  {
    identifier: { execution_id: 'version-1' },
    auditing_data: { created_at: '2023-01-01T00:00:00Z' },
    status: 'RUNNING',
    stages: [
      {
        name: 'Build',
        status: 'SUCCESS',
        duration: '5m',
        services: [
          {
            identifier: {
              service_id: 'service-1',
            },
          },
        ],
      },
    ],
  },
  {
    identifier: { execution_id: 'version-2' },
    auditing_data: { created_at: '2023-01-01T00:00:00Z' },
    status: 'RUNNING',
    stages: [
      {
        name: 'Build',
        status: 'SUCCESS',
        duration: '5m',
        services: [
          {
            identifier: {
              service_id: 'service-1',
            },
          },
          {
            identifier: {
              service_id: 'service-2',
            },
          },
        ],
      },
    ],
  },
]

describe('BreadcrumbDeploymentHistory', () => {
  beforeEach(() => {
    useDeploymentHistory.mockReturnValue({
      data: mockDeploymentHistory,
      isFetched: true,
    })
    useService.mockReturnValue({
      data: {
        service_type: 'APPLICATION',
      },
      isFetched: true,
    })
  })

  it('renders correctly with deployment history', async () => {
    const { userEvent } = renderWithProviders(<BreadcrumbDeploymentHistory type="DEPLOYMENT" serviceId="service-1" />, {
      container: document.body,
    })

    expect(screen.getByText('Deployment History')).toBeInTheDocument()
    expect(screen.getByText('Latest')).toBeInTheDocument()

    const dropdownButton = screen.getByRole('button')

    await userEvent.click(dropdownButton)

    expect(screen.getByText('versi...n-1')).toBeInTheDocument()
    expect(screen.getByText('versi...n-2')).toBeInTheDocument()
  })
})
