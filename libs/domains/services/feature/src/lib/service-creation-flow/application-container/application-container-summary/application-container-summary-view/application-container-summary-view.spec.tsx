import { PortProtocolEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationContainerSummaryView } from './application-container-summary-view'

const defaultProps = {
  generalData: {
    name: 'console-app',
    serviceType: 'APPLICATION' as const,
    auto_deploy: true,
    repository: 'https://github.com/Qovery/console',
    branch: 'staging',
    root_path: '/',
    dockerfile_path: 'Dockerfile',
    cmd_arguments: 'npm start',
  },
  resourcesData: {
    cpu: 500,
    memory: 512,
    gpu: 0,
    min_running_instances: 1,
    max_running_instances: 2,
    autoscaling_mode: 'HPA' as const,
  },
  portsData: {
    ports: [
      {
        application_port: 3000,
        is_public: true,
        protocol: PortProtocolEnum.HTTP,
        external_port: 443,
        name: 'web',
        public_path: '/',
      },
    ],
    healthchecks: {
      typeLiveness: 'TCP',
      typeReadiness: 'HTTP',
      item: {
        liveness_probe: {
          initial_delay_seconds: 30,
          period_seconds: 10,
          timeout_seconds: 5,
          success_threshold: 1,
          failure_threshold: 3,
          type: { tcp: { port: 3000 } },
        },
        readiness_probe: {
          initial_delay_seconds: 30,
          period_seconds: 10,
          timeout_seconds: 1,
          success_threshold: 1,
          failure_threshold: 3,
          type: { http: { port: 3000, path: '/' } },
        },
      },
    },
  },
  variablesData: [
    {
      variable: 'NODE_ENV',
      value: 'production',
      scope: 'APPLICATION' as const,
      isSecret: false,
    },
  ],
  selectedRegistryName: 'Docker Hub',
  annotationsGroup: [],
  labelsGroup: [],
  onEditGeneral: jest.fn(),
  onEditResources: jest.fn(),
  onEditPorts: jest.fn(),
  onEditHealthchecks: jest.fn(),
  onEditVariables: jest.fn(),
  onBack: jest.fn(),
  onSubmit: jest.fn(),
  isLoadingCreate: false,
  isLoadingCreateAndDeploy: false,
}

describe('ApplicationContainerSummaryView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders summary sections', () => {
    renderWithProviders(<ApplicationContainerSummaryView {...defaultProps} />)

    expect(screen.getByRole('heading', { name: 'General information' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ports' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Health checks' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Environment variables' })).toBeInTheDocument()
  })

  it('calls edit and submit actions', async () => {
    const { userEvent } = renderWithProviders(<ApplicationContainerSummaryView {...defaultProps} />)

    await userEvent.click(screen.getByTestId('edit-general-button'))
    await userEvent.click(screen.getByTestId('edit-variables-button'))
    await userEvent.click(screen.getByTestId('button-create'))
    await userEvent.click(screen.getByTestId('button-create-deploy'))

    expect(defaultProps.onEditGeneral).toHaveBeenCalled()
    expect(defaultProps.onEditVariables).toHaveBeenCalled()
    expect(defaultProps.onSubmit).toHaveBeenNthCalledWith(1, false)
    expect(defaultProps.onSubmit).toHaveBeenNthCalledWith(2, true)
  })

  it('renders empty states when no ports or variables are configured', () => {
    renderWithProviders(
      <ApplicationContainerSummaryView
        {...defaultProps}
        portsData={{ ports: [], healthchecks: undefined }}
        variablesData={[]}
      />
    )

    expect(screen.getByText('No port declared')).toBeInTheDocument()
    expect(screen.getByText('No variable declared')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Health checks' })).not.toBeInTheDocument()
  })
})
