import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ApplicationContainerStepSummary } from './step-summary'

const mockNavigate = jest.fn()
const mockSetCurrentStep = jest.fn()
const mockCreateService = jest.fn()
const mockImportVariables = jest.fn()
const mockDeployService = jest.fn()
const mockEditAdvancedSettings = jest.fn()
const mockCapture = jest.fn()
const mockUseApplicationContainerCreateContext = jest.fn()

jest.mock('posthog-js', () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
    slug: 'application',
  }),
  useSearch: () => ({
    template: 'nextjs',
    option: 'current',
  }),
  useNavigate: () => mockNavigate,
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  useImportVariables: () => ({ mutateAsync: mockImportVariables }),
}))

jest.mock('../../../../hooks/use-create-service/use-create-service', () => ({
  useCreateService: () => ({ mutateAsync: mockCreateService }),
}))

jest.mock('../../../../hooks/use-deploy-service/use-deploy-service', () => ({
  useDeployService: () => ({ mutateAsync: mockDeployService }),
}))

jest.mock('../../../../hooks/use-edit-advanced-settings/use-edit-advanced-settings', () => ({
  useEditAdvancedSettings: () => ({ mutateAsync: mockEditAdvancedSettings }),
}))

jest.mock('../../application-container-creation-flow', () => ({
  steps: Array.from({ length: 6 }, () => ({ title: 'step' })),
  useApplicationContainerCreateContext: () => mockUseApplicationContainerCreateContext(),
}))

jest.mock('../application-container-summary-view/application-container-summary-view', () => ({
  ApplicationContainerSummaryView: ({
    generalData,
    onSubmit,
  }: {
    generalData: { serviceType: 'APPLICATION' | 'CONTAINER' }
    onSubmit: (withDeploy: boolean) => void
  }) => (
    <div>
      <h1>Ready to create your {generalData.serviceType === 'APPLICATION' ? 'Application' : 'Container'}</h1>
      <button data-testid="button-create" type="button" onClick={() => onSubmit(false)}>
        Create
      </button>
      <button data-testid="button-create-deploy" type="button" onClick={() => onSubmit(true)}>
        Create and deploy
      </button>
    </div>
  ),
}))

const generalData = {
  name: 'console-app',
  serviceType: 'APPLICATION' as const,
  auto_deploy: true,
  repository: 'https://github.com/Qovery/console',
  branch: 'staging',
  root_path: '/',
  dockerfile_path: 'Dockerfile',
}

const portData = {
  ports: [
    {
      application_port: 3000,
      is_public: true,
      protocol: 'HTTP',
      external_port: 443,
      name: 'web',
    },
  ],
  healthchecks: undefined,
}

const variablesData = [
  {
    variable: 'NODE_ENV',
    value: 'production',
    scope: 'APPLICATION' as const,
    isSecret: false,
  },
]

function renderComponent({ autoscalingMode = 'NONE' }: { autoscalingMode?: 'NONE' | 'HPA' } = {}) {
  mockUseApplicationContainerCreateContext.mockReturnValue({
    creationFlowUrl: '/organization/org-1/project/proj-1/environment/env-1/service/create/application',
    setCurrentStep: mockSetCurrentStep,
    generalForm: { getValues: () => generalData },
    resourcesForm: {
      getValues: () => ({
        cpu: 500,
        memory: 512,
        gpu: 0,
        min_running_instances: 1,
        max_running_instances: 2,
        autoscaling_mode: autoscalingMode,
        hpa_metric_type: 'CPU',
        hpa_cpu_average_utilization_percent: 60,
      }),
    },
    portForm: { getValues: () => portData },
    variablesForm: { getValues: () => ({ variables: variablesData }) },
  })

  return renderWithProviders(
    <ApplicationContainerStepSummary selectedRegistryName="Docker Hub" annotationsGroup={[]} labelsGroup={[]} />
  )
}

describe('ApplicationContainerStepSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateService.mockResolvedValue({ id: 'service-1' })
    mockImportVariables.mockResolvedValue(undefined)
    mockDeployService.mockResolvedValue(undefined)
    mockEditAdvancedSettings.mockResolvedValue(undefined)
  })

  it('renders summary and creates the service', async () => {
    const { userEvent } = renderComponent()

    expect(screen.getByRole('heading', { name: 'Ready to create your Application' })).toBeInTheDocument()
    expect(mockSetCurrentStep).toHaveBeenCalledWith(6)

    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateService).toHaveBeenCalledWith({
        environmentId: 'env-1',
        payload: expect.objectContaining({
          serviceType: 'APPLICATION',
          name: 'console-app',
        }),
      })
    })

    expect(mockImportVariables).toHaveBeenCalledWith({
      serviceType: 'APPLICATION',
      serviceId: 'service-1',
      variableImportRequest: {
        overwrite: true,
        vars: [
          {
            name: 'NODE_ENV',
            value: 'production',
            scope: 'APPLICATION',
            is_secret: false,
          },
        ],
      },
    })
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: {
        organizationId: 'org-1',
        projectId: 'proj-1',
        environmentId: 'env-1',
      },
    })
    expect(mockCapture).toHaveBeenCalledWith('create-service', {
      selectedServiceType: 'application',
      selectedServiceSubType: 'current',
    })
  })

  it('deploys after create when create and deploy is clicked', async () => {
    const { userEvent } = renderComponent({ autoscalingMode: 'HPA' })

    await userEvent.click(screen.getByTestId('button-create-deploy'))

    await waitFor(() => {
      expect(mockDeployService).toHaveBeenCalledWith({
        serviceId: 'service-1',
        serviceType: 'APPLICATION',
      })
    })

    expect(mockEditAdvancedSettings).toHaveBeenCalledWith({
      serviceId: 'service-1',
      payload: expect.objectContaining({
        serviceType: 'APPLICATION',
      }),
    })
  })
})
