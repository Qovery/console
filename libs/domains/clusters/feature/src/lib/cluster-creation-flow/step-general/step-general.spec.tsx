import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  ClusterContainerCreateContext,
  type ClusterContainerCreateContextInterface,
  defaultResourcesData,
} from '../cluster-creation-flow'
import StepGeneral, { type StepGeneralProps } from './step-general'

const mockOnSubmit = jest.fn()

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
    openModal: jest.fn(),
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
}

describe('StepGeneral', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  it('should render general settings form', () => {
    renderWithProviders(<StepGeneral {...defaultProps} />, { wrapper: Wrapper })

    expect(screen.getByTestId('input-name')).toBeInTheDocument()
    expect(screen.getByTestId('input-description')).toBeInTheDocument()
    expect(screen.getByTestId('input-cloud-provider')).toBeInTheDocument()
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
})
