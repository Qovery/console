import { useFeatureFlagEnabled } from 'posthog-js/react'
import { CloudProviderEnum, type SecretManagerAccess } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useSecretManagerAssociatedServices } from '../../hooks/use-secret-manager-associated-services/use-secret-manager-associated-services'
import {
  ClusterContainerCreateContext,
  type ClusterContainerCreateContextInterface,
  defaultResourcesData,
} from '../cluster-creation-flow'
import StepAddons, { type StepAddonsProps } from './step-addons'

const mockOnSubmit = jest.fn()
const mockSetCurrentStep = jest.fn()
const mockSetAddonsData = jest.fn()

const awsSecretManager = {
  id: 'secret-manager-id',
  name: 'AWS Secret Manager',
  endpoint: {
    mode: 'AWS_SECRET_MANAGER',
  },
  authentication: {
    mode: 'AWS_ROLE_ARN',
  },
} as SecretManagerAccess

const awsParameterStore = {
  name: 'AWS Parameter Store',
  endpoint: {
    mode: 'AWS_PARAMETER_STORE',
  },
  authentication: {
    mode: 'AUTOMATICALLY_CONFIGURED',
  },
} as SecretManagerAccess

const mockContextValue: ClusterContainerCreateContextInterface = {
  currentStep: 4,
  setCurrentStep: mockSetCurrentStep,
  generalData: {
    name: 'test-cluster',
    cloud_provider: CloudProviderEnum.AWS,
    region: 'us-east-1',
    installation_type: 'MANAGED',
  },
  setGeneralData: jest.fn(),
  resourcesData: defaultResourcesData,
  setResourcesData: jest.fn(),
  featuresData: { vpc_mode: undefined, features: {} },
  setFeaturesData: jest.fn(),
  kubeconfigData: undefined,
  setKubeconfigData: jest.fn(),
  addonsData: { kedaActivated: false, secretManagers: [] },
  setAddonsData: mockSetAddonsData,
  creationFlowUrl: '/organization/org-123/cluster/create/aws',
}

function getWrapper(contextValue: ClusterContainerCreateContextInterface = mockContextValue) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <ClusterContainerCreateContext.Provider value={contextValue}>{children}</ClusterContainerCreateContext.Provider>
    )
  }
}

jest.mock('posthog-js/react', () => ({
  __esModule: true,
  useFeatureFlagEnabled: jest.fn(() => true),
}))

jest.mock(
  '@qovery/shared/util-clusters',
  () => ({
    isSameSecretManagerAccess: (secretManager: SecretManagerAccess, targetSecretManager: SecretManagerAccess) => {
      if (secretManager.id && targetSecretManager.id) {
        return secretManager.id === targetSecretManager.id
      }

      return secretManager === targetSecretManager
    },
  }),
  { virtual: true }
)

jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useParams: () => ({ organizationId: 'org-123', slug: 'aws' }),
    useRouterState: () => ({ location: { pathname: '/' } }),
    useRouter: () => ({ buildLocation: jest.fn(() => ({ href: '/' })) }),
    Link: React.forwardRef(
      ({ children, ...props }: { children?: React.ReactNode }, ref: React.Ref<HTMLAnchorElement>) =>
        React.createElement('a', { ref, ...props }, children)
    ),
  }
})

jest.mock('../../hooks/use-secret-manager-associated-services/use-secret-manager-associated-services', () => ({
  useSecretManagerAssociatedServices: jest.fn(),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: ({ content }: { content: { props: { option: { value: string }; onSubmit: jest.Mock } } }) => {
      content.props.onSubmit(
        content.props.option.value === 'AWS_PARAMETER_STORE' ? awsParameterStore : awsSecretManager
      )
    },
    closeModal: jest.fn(),
  }),
}))

const defaultProps: StepAddonsProps = {
  organizationId: 'org-123',
  onSubmit: mockOnSubmit,
}

const mockUseFeatureFlagEnabled = useFeatureFlagEnabled as jest.Mock
const mockUseSecretManagerAssociatedServices = useSecretManagerAssociatedServices as jest.Mock

describe('StepAddons', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseFeatureFlagEnabled.mockReturnValue(true)
    mockUseSecretManagerAssociatedServices.mockReturnValue({
      data: [],
      isLoading: false,
    })
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should sync KEDA activation to addons data', async () => {
    const { userEvent } = renderWithProviders(<StepAddons {...defaultProps} />, { wrapper: getWrapper() })

    await userEvent.click(screen.getByRole('button', { name: /activate/i }))

    await waitFor(() => {
      expect(mockSetAddonsData).toHaveBeenLastCalledWith({
        kedaActivated: true,
        secretManagers: [],
      })
    })
  })

  it('should add selected secret managers to addons data', async () => {
    const { userEvent } = renderWithProviders(<StepAddons {...defaultProps} />, { wrapper: getWrapper() })

    await userEvent.click(screen.getByRole('button', { name: /add secret manager/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: /aws parameter store/i }))

    await waitFor(() => {
      expect(mockSetAddonsData).toHaveBeenLastCalledWith({
        kedaActivated: false,
        secretManagers: [awsParameterStore],
      })
    })
  })

  it('should remove deleted secret managers from addons data', async () => {
    const contextValue: ClusterContainerCreateContextInterface = {
      ...mockContextValue,
      addonsData: { kedaActivated: true, secretManagers: [awsSecretManager] },
    }

    const { userEvent } = renderWithProviders(<StepAddons {...defaultProps} />, { wrapper: getWrapper(contextValue) })

    await userEvent.click(screen.getByRole('button', { name: 'Delete secret manager' }))

    await waitFor(() => {
      expect(mockSetAddonsData).toHaveBeenLastCalledWith({
        kedaActivated: true,
        secretManagers: [],
      })
    })
  })
})
