import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DeploymentLogsPlaceholder, type DeploymentLogsPlaceholderProps } from './deployment-logs-placeholder'

const mockApplication = applicationFactoryMock(1)[0]

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => ({ data: mockApplication }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    organizationId: 'org-123',
    projectId: 'proj-123',
    environmentId: 'env-123',
    serviceId: 'serv-123',
  }),
}))

describe('DeploymentLogsPlaceholder', () => {
  const props: DeploymentLogsPlaceholderProps = {
    serviceStatus: undefined,
    itemsLength: 0,
    environmentDeploymentHistory: [],
  }

  it('should render deployment history', () => {
    renderWithProviders(
      <DeploymentLogsPlaceholder
        itemsLength={1}
        environmentDeploymentHistory={[
          {
            identifier: {
              execution_id: 'exec-1',
              environment_id: 'env-123',
            },
            stages: [
              {
                name: 'test',
                status: 'ONGOING',
                duration: '',
                services: [
                  {
                    identifier: {
                      name: 'service',
                      service_type: 'APPLICATION',
                      service_id: 'serv-123',
                    },
                    status: 'BUILDING',
                    auditing_data: {
                      created_at: '2024-09-18T07:02:14.324855Z',
                      updated_at: '',
                      triggered_by: '',
                    },
                    details: {},
                  },
                ],
              },
            ],
            auditing_data: {},
            status: 'BUILDING',
            trigger_action: 'DEPLOY',
            total_duration: '',
          },
        ]}
      />
    )

    expect(screen.getByText('Last deployment logs')).toBeInTheDocument()
    expect(screen.getByText('exec-...c-1')).toBeInTheDocument()
  })

  it('should render "No history deployment available"', () => {
    props.itemsLength = 1
    renderWithProviders(<DeploymentLogsPlaceholder {...props} />)

    expect(screen.getByText('No history deployment available for this service.')).toBeInTheDocument()
  })

  it('should render spinner', () => {
    renderWithProviders(
      <DeploymentLogsPlaceholder
        itemsLength={0}
        serviceStatus={{
          id: '0',
          state: 'DEPLOYED',
          service_deployment_status: 'UP_TO_DATE',
          is_part_last_deployment: true,
        }}
      />
    )

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should render no logs placeholder', () => {
    renderWithProviders(
      <DeploymentLogsPlaceholder
        itemsLength={0}
        environmentDeploymentHistory={[]}
        serviceStatus={{
          id: '0',
          state: 'DEPLOYED',
          service_deployment_status: 'UP_TO_DATE',
          is_part_last_deployment: false,
        }}
      />
    )

    expect(
      screen.getByText('This service was deployed more than 30 days ago and thus no deployment logs are available.')
    ).toBeInTheDocument()
  })
})
