import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { HelmStepSummary } from './step-summary'

const mockNavigate = jest.fn()
const mockSetCurrentStep = jest.fn()
const mockCreateHelmService = jest.fn()
const mockDeployService = jest.fn()
const mockCapture = jest.fn()
const mockUseHelmCreateContext = jest.fn()

jest.mock('posthog-js', () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
  useSearch: () => ({
    template: 'kubecost',
  }),
  useNavigate: () => mockNavigate,
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useDeployService: () => ({ mutateAsync: mockDeployService }),
}))

jest.mock('../../hooks/use-create-helm-service/use-create-helm-service', () => ({
  useCreateHelmService: () => ({ mutateAsync: mockCreateHelmService }),
}))

jest.mock('../../hooks/use-helm-repositories/use-helm-repositories', () => ({
  useHelmRepositories: () => ({ data: [] }),
}))

jest.mock('../helm-creation-flow', () => ({
  helmCreationSteps: Array.from({ length: 4 }, () => ({ title: 'step' })),
  useHelmCreateContext: () => mockUseHelmCreateContext(),
}))

jest.mock('./helm-summary-view', () => ({
  HelmSummaryView: ({ onSubmit }: { onSubmit: (withDeploy: boolean) => void }) => (
    <div>
      <h1>Ready to create your Helm chart</h1>
      <button data-testid="button-create" type="button" onClick={() => onSubmit(false)}>
        Create
      </button>
      <button data-testid="button-create-deploy" type="button" onClick={() => onSubmit(true)}>
        Create and deploy
      </button>
    </div>
  ),
}))

const baseContextValue = {
  creationFlowUrl: '/organization/org-1/project/proj-1/environment/env-1/service/create/helm',
  setCurrentStep: mockSetCurrentStep,
  generalForm: {
    getValues: () => ({
      name: 'helm-app',
      description: 'Helm service',
      icon_uri: 'app://qovery-console/helm',
      source_provider: 'GIT',
      provider: 'GITHUB',
      branch: 'main',
      root_path: '/',
      auto_deploy: true,
      timeout_sec: '600',
      arguments: '--wait --atomic',
      allow_cluster_wide_resources: true,
      git_repository: {
        id: 'repo-1',
        name: 'Qovery/console',
        url: 'https://github.com/Qovery/console',
        default_branch: 'main',
        is_private: false,
      },
    }),
  },
  valuesOverrideFileForm: {
    getValues: () => ({
      type: 'GIT_REPOSITORY',
      provider: 'GITHUB',
      git_token_id: 'token-1',
      branch: 'staging',
      repository: 'https://github.com/Qovery/values',
      paths: 'values/dev.yaml; values/common.yaml',
      auto_deploy: false,
      git_repository: {
        id: 'repo-2',
        name: 'Qovery/values',
        url: 'https://github.com/Qovery/values',
        default_branch: 'main',
        is_private: true,
      },
    }),
  },
  valuesOverrideArgumentsForm: {
    getValues: () => ({
      arguments: [
        { type: '--set', key: 'image.tag', value: 'v1' },
        { type: '--set-json', key: 'resources', value: '', json: '{"limits":{"cpu":"500m"}}' },
      ],
    }),
  },
}

function setup() {
  mockUseHelmCreateContext.mockReturnValue(baseContextValue)

  return renderWithProviders(<HelmStepSummary labelsGroup={[]} annotationsGroup={[]} />)
}

describe('HelmStepSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseHelmCreateContext.mockReturnValue(baseContextValue)
    mockCreateHelmService.mockResolvedValue({ id: 'helm-1' })
    mockDeployService.mockResolvedValue(undefined)
  })

  it('creates the HELM service and navigates to overview', async () => {
    const { userEvent } = setup()

    expect(screen.getByRole('heading', { name: 'Ready to create your Helm chart' })).toBeInTheDocument()
    expect(mockSetCurrentStep).toHaveBeenCalledWith(4)

    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateHelmService).toHaveBeenCalledWith({
        environmentId: 'env-1',
        helmRequest: {
          name: 'helm-app',
          description: 'Helm service',
          icon_uri: 'app://qovery-console/helm',
          source: {
            git_repository: {
              url: 'https://github.com/Qovery/console',
              branch: 'main',
              root_path: '/',
              git_token_id: undefined,
            },
          },
          allow_cluster_wide_resources: true,
          arguments: ['--wait', '--atomic'],
          timeout_sec: 600,
          auto_deploy: true,
          values_override: {
            set: [['image.tag', 'v1']],
            set_string: [],
            set_json: [['resources', '{"limits":{"cpu":"500m"}}']],
            file: {
              git: {
                git_repository: {
                  provider: 'GITHUB',
                  url: 'https://github.com/Qovery/values',
                  branch: 'staging',
                  git_token_id: 'token-1',
                },
                paths: ['values/dev.yaml', 'values/common.yaml'],
              },
            },
          },
        },
      })
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
      selectedServiceType: 'helm',
      selectedServiceSubType: 'kubecost',
    })
  })

  it('deploys after create when create and deploy is clicked', async () => {
    const { userEvent } = setup()

    await userEvent.click(screen.getByTestId('button-create-deploy'))

    await waitFor(() => {
      expect(mockDeployService).toHaveBeenCalledWith({
        serviceId: 'helm-1',
        serviceType: 'HELM',
      })
    })
  })
})
