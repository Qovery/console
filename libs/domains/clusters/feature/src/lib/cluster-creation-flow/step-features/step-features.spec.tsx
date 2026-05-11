import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  ClusterContainerCreateContext,
  type ClusterContainerCreateContextInterface,
  defaultResourcesData,
} from '../cluster-creation-flow'
import StepFeatures, { type StepFeaturesProps } from './step-features'

const mockOnSubmit = jest.fn()
const mockSetCurrentStep = jest.fn()

const mockContextValue: ClusterContainerCreateContextInterface = {
  currentStep: 3,
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
  creationFlowUrl: '/organization/org-123/cluster/create/aws',
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <ClusterContainerCreateContext.Provider value={mockContextValue}>{children}</ClusterContainerCreateContext.Provider>
  )
}

jest.mock('./aws-vpc-feature/aws-vpc-feature', () => ({
  AWSVpcFeature: () => <div data-testid="aws-vpc-feature">Mocked AWSVpcFeature</div>,
  __esModule: true,
  default: () => <div data-testid="aws-vpc-feature">Mocked AWSVpcFeature</div>,
}))

jest.mock('./gcp-vpc-feature/gcp-vpc-feature', () => ({
  GCPVpcFeature: () => <div data-testid="gcp-vpc-feature">Mocked GCPVpcFeature</div>,
  __esModule: true,
  default: () => <div data-testid="gcp-vpc-feature">Mocked GCPVpcFeature</div>,
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDocumentTitle: jest.fn(),
}))

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

const useCloudProviderFeaturesMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviderFeatures') as jest.Mock

const defaultProps: StepFeaturesProps = {
  organizationId: 'org-123',
  onSubmit: mockOnSubmit,
}

describe('StepFeatures', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCloudProviderFeaturesMockSpy.mockReturnValue({
      data: [
        {
          id: 'STATIC_IP',
          title: 'Static IP',
          value_object: { value: false },
        },
      ],
    })
  })

  it('should render features form', async () => {
    renderWithProviders(<StepFeatures {...defaultProps} />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByText('Network configuration')).toBeInTheDocument()
      expect(screen.getByTestId('button-submit')).toBeInTheDocument()
    })
  })

  it('should set current step on mount', async () => {
    renderWithProviders(<StepFeatures {...defaultProps} />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(mockSetCurrentStep).toHaveBeenCalled()
    })
  })
})
