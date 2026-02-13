import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  ClusterContainerCreateContext,
  type ClusterContainerCreateContextInterface,
  defaultResourcesData,
} from '../cluster-creation-flow'
import StepSummary, { type StepSummaryProps } from './step-summary'

const mockSetCurrentStep = jest.fn()
const mockNavigate = jest.fn()

const mockContextValue: ClusterContainerCreateContextInterface = {
  currentStep: 4,
  setCurrentStep: mockSetCurrentStep,
  generalData: {
    name: 'test-cluster',
    cloud_provider: CloudProviderEnum.AWS,
    region: 'us-east-1',
    installation_type: 'MANAGED',
    production: false,
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

jest.mock('../../hooks/use-create-cluster/use-create-cluster', () => ({
  useCreateCluster: () => ({
    mutateAsync: jest.fn(),
    isLoading: false,
  }),
}))

jest.mock('../../hooks/use-edit-cloud-provider-info/use-edit-cloud-provider-info', () => ({
  useEditCloudProviderInfo: () => ({
    mutateAsync: jest.fn(),
  }),
}))

jest.mock('../../hooks/use-deploy-cluster/use-deploy-cluster', () => ({
  useDeployCluster: () => ({
    mutateAsync: jest.fn(),
    isLoading: false,
  }),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))

const useCloudProviderInstanceTypesMockSpy = jest.spyOn(
  cloudProvidersDomain,
  'useCloudProviderInstanceTypes'
) as jest.Mock

const defaultProps: StepSummaryProps = {
  organizationId: 'org-123',
}

describe('StepSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCloudProviderInstanceTypesMockSpy.mockReturnValue({
      data: [],
    })
  })

  it('should render summary content', async () => {
    renderWithProviders(<StepSummary {...defaultProps} />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByText('Ready to install your cluster')).toBeInTheDocument()
      expect(screen.getByTestId('button-create')).toBeInTheDocument()
      expect(screen.getByTestId('button-create-deploy')).toBeInTheDocument()
    })
  })

  it('should set current step on mount', async () => {
    renderWithProviders(<StepSummary {...defaultProps} />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(mockSetCurrentStep).toHaveBeenCalled()
    })
  })
})
