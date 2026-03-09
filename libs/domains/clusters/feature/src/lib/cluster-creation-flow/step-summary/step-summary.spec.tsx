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
const mockCreateCluster = jest.fn()
const mockEditCloudProviderInfo = jest.fn()
const mockEditClusterKubeconfig = jest.fn()
const mockDeployCluster = jest.fn()

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
  addonsData: { observabilityActivated: false, kedaActivated: false, secretManagers: [] },
  setAddonsData: jest.fn(),
  creationFlowUrl: '/organization/org-123/cluster/create/aws',
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <ClusterContainerCreateContext.Provider value={mockContextValue}>{children}</ClusterContainerCreateContext.Provider>
  )
}

jest.mock('../../hooks/use-create-cluster/use-create-cluster', () => ({
  useCreateCluster: () => ({
    mutateAsync: mockCreateCluster,
    isLoading: false,
  }),
}))

jest.mock('../../hooks/use-edit-cloud-provider-info/use-edit-cloud-provider-info', () => ({
  useEditCloudProviderInfo: () => ({
    mutateAsync: mockEditCloudProviderInfo,
  }),
}))

jest.mock('../../hooks/use-edit-cluster-kubeconfig/use-edit-cluster-kubeconfig', () => ({
  useEditClusterKubeconfig: () => ({
    mutateAsync: mockEditClusterKubeconfig,
  }),
}))

jest.mock('../../hooks/use-deploy-cluster/use-deploy-cluster', () => ({
  useDeployCluster: () => ({
    mutateAsync: mockDeployCluster,
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
    mockContextValue.generalData = {
      name: 'test-cluster',
      cloud_provider: CloudProviderEnum.AWS,
      region: 'us-east-1',
      installation_type: 'MANAGED',
      production: false,
    }
    mockContextValue.kubeconfigData = undefined
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

  it('should navigate to clusters when kubeconfig upload fails after partially managed cluster creation', async () => {
    mockContextValue.generalData = {
      name: 'test-cluster',
      description: 'description',
      cloud_provider: CloudProviderEnum.AWS,
      region: 'us-east-1',
      installation_type: 'PARTIALLY_MANAGED',
      production: false,
      credentials: 'cred-id',
      credentials_name: 'cred-name',
    }
    mockContextValue.kubeconfigData = {
      file_name: 'cluster.yml',
      file_content: 'apiVersion: v1',
      file_size: 123,
    }
    mockCreateCluster.mockResolvedValue({ id: 'cluster-123' })
    mockEditClusterKubeconfig.mockRejectedValue(new Error('kubeconfig upload failed'))

    const { userEvent } = renderWithProviders(<StepSummary {...defaultProps} />, { wrapper: Wrapper })

    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/organization/org-123/clusters' })
    })
  })
})
