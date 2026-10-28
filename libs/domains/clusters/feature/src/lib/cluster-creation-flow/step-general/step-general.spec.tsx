import { act } from '@testing-library/react'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  ClusterContainerCreateContext,
  type ClusterContainerCreateContextInterface,
  defaultResourcesData,
} from '../cluster-creation-flow'
import StepGeneral, { type StepGeneralProps } from './step-general'

const mockUseFeatureFlagEnabled = jest.fn()
const mockOnSubmit = jest.fn()
const mockOpenModal = jest.fn()

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: (...args: unknown[]) => mockUseFeatureFlagEnabled(...args),
}))

const mockContextValue: ClusterContainerCreateContextInterface = {
  currentStep: 1,
  setCurrentStep: jest.fn(),
  generalData: undefined,
  setGeneralData: jest.fn(),
  resourcesData: defaultResourcesData,
  setResourcesData: jest.fn(),
  featuresData: { vpc_mode: undefined, features: {} },
  setFeaturesData: jest.fn(),
  kubeconfigData: undefined,
  setKubeconfigData: jest.fn(),
  addonsData: { kedaActivated: false, secretManagers: [] },
  setAddonsData: jest.fn(),
  creationFlowUrl: '/organization/org-123/cluster/create/aws',
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <ClusterContainerCreateContext.Provider value={mockContextValue}>{children}</ClusterContainerCreateContext.Provider>
  )
}

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDocumentTitle: jest.fn(),
}))

jest.mock('@qovery/shared/iam/feature', () => ({
  ...jest.requireActual('@qovery/shared/iam/feature'),
  useUserRole: () => ({
    isQoveryAdminUser: false,
    isQoveryUser: false,
    loading: false,
    roles: [],
  }),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
  }),
}))

jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useParams: () => ({ organizationId: 'org-123' }),
    useRouterState: () => ({ location: { pathname: '/' } }),
    useRouter: () => ({ buildLocation: jest.fn(() => ({ href: '/' })) }),
    Link: React.forwardRef(
      ({ children, ...props }: { children?: React.ReactNode }, ref: React.Ref<HTMLAnchorElement>) =>
        React.createElement('a', { ref, ...props }, children)
    ),
  }
})

const useCloudProvidersMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviders') as jest.Mock
const useCloudProviderCredentialsMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviderCredentials') as jest.Mock

const defaultProps: StepGeneralProps = {
  organizationId: 'org-123',
  onSubmit: mockOnSubmit,
  labelsSetting: null,
}

describe('StepGeneral', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseFeatureFlagEnabled.mockReturnValue(false)
    mockContextValue.generalData = undefined
    useCloudProvidersMockSpy.mockReturnValue({
      data: [
        {
          name: 'AWS',
          short_name: CloudProviderEnum.AWS,
          regions: [{ name: 'us-east-1', city: 'Virginia', country_code: 'US' }],
        },
      ],
    })
    useCloudProviderCredentialsMockSpy.mockReturnValue({ data: [{ id: '1', name: 'creds' }] })
  })

  it('continues with the created credential and preserves edited cluster fields', async () => {
    mockContextValue.generalData = {
      name: '',
      credentials: '',
      credentials_name: '',
      cloud_provider: 'AWS',
      installation_type: 'MANAGED',
      region: 'us-east-1',
    }
    useCloudProviderCredentialsMockSpy.mockReturnValue({ data: [], isLoading: false })
    const { userEvent } = renderWithProviders(<StepGeneral {...defaultProps} />, { wrapper: Wrapper })
    await userEvent.type(screen.getByTestId('input-name'), 'production-cluster')
    await userEvent.type(screen.getByTestId('input-description'), 'Preserve this description')
    expect(screen.getByTestId('button-submit')).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add New Credential' }))
    const credential = { id: 'new-credential', name: 'New AWS credential' }
    useCloudProviderCredentialsMockSpy.mockReturnValue({ data: [credential], isLoading: false })
    act(() => mockOpenModal.mock.calls[0][0].content.props.onClose(credential))
    await userEvent.click(screen.getByTestId('button-submit'))
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'production-cluster',
        description: 'Preserve this description',
        production: true,
        region: 'us-east-1',
        cloud_provider: 'AWS',
        credentials: 'new-credential',
        credentials_name: 'New AWS credential',
      })
    )
    mockContextValue.generalData = undefined
  })

  it('should render general settings form', () => {
    renderWithProviders(<StepGeneral {...defaultProps} />, { wrapper: Wrapper })

    expect(screen.getByTestId('input-name')).toBeInTheDocument()
    expect(screen.getByTestId('input-description')).toBeInTheDocument()
    expect(screen.getByTestId('input-cloud-provider')).toBeInTheDocument()
  })

  it('should show wide credentials and submit the default restrictive mode for managed AWS', async () => {
    mockUseFeatureFlagEnabled.mockReturnValue(true)
    mockContextValue.generalData = {
      name: 'test-cluster',
      credentials: 'role-1',
      credentials_name: 'role-credential',
      cloud_provider: CloudProviderEnum.AWS,
      installation_type: 'MANAGED',
      region: 'us-east-1',
    }

    const { userEvent } = renderWithProviders(<StepGeneral {...defaultProps} />, { wrapper: Wrapper })

    const restrictivePermissionsToggle = screen.getByRole('switch', { name: 'Use restrictive permissions' })
    expect(restrictivePermissionsToggle).not.toBeChecked()

    await userEvent.click(screen.getByTestId('button-submit'))

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({ using_restrictive_permissions: false }))
  })

  it('should keep the EKS Anywhere credential flow when the feature flag is enabled', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(true)
    mockContextValue.generalData = {
      name: 'test-cluster',
      credentials: 'eks-credential',
      credentials_name: 'EKS Anywhere credential',
      cloud_provider: CloudProviderEnum.AWS,
      installation_type: 'PARTIALLY_MANAGED',
      region: 'us-east-1',
    }

    renderWithProviders(<StepGeneral {...defaultProps} />, { wrapper: Wrapper })

    expect(screen.queryByRole('switch', { name: 'Use restrictive permissions' })).not.toBeInTheDocument()
  })

  it('should show loader when cloud providers are not loaded', () => {
    useCloudProvidersMockSpy.mockReturnValue({ data: [] })

    renderWithProviders(<StepGeneral {...defaultProps} />, { wrapper: Wrapper })

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should have submit button disabled when form is invalid', () => {
    renderWithProviders(<StepGeneral {...defaultProps} />, { wrapper: Wrapper })

    expect(screen.getByTestId('button-submit')).toBeDisabled()
  })

  it('should display an ARM badge for GCP regions with ARM support', async () => {
    useCloudProvidersMockSpy.mockReturnValue({
      data: [
        {
          name: 'GCP',
          short_name: CloudProviderEnum.GCP,
          regions: [
            { name: 'us-east1', city: 'South Carolina', country_code: 'US', arm_supported: true },
            { name: 'europe-west9', city: 'Paris', country_code: 'FR', arm_supported: false },
          ],
        },
      ],
    })

    renderWithProviders(<StepGeneral {...defaultProps} />, { wrapper: Wrapper })

    await selectEvent.select(screen.getByLabelText('Cloud provider'), 'Gcp', { container: document.body })
    const regionSelect = await screen.findByLabelText('Region')
    selectEvent.openMenu(regionSelect)

    expect(await screen.findAllByText('ARM')).toHaveLength(1)
  })
})
