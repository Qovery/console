import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { type ClusterGeneralData } from '@qovery/shared/interfaces'
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
const mockUpdatePlatformBinding = jest.fn()
const mockAttachClusterOperator = jest.fn()

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(() => true),
}))

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
  addonsData: { kedaActivated: false, secretManagers: [] },
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

jest.mock('../../platform-configuration/hooks/use-update-platform-binding', () => ({
  useUpdatePlatformBinding: () => ({
    mutateAsync: mockUpdatePlatformBinding,
    isLoading: false,
  }),
}))

jest.mock('../../platform-configuration/hooks/use-cluster-operator', () => ({
  useAttachClusterOperator: () => ({
    mutateAsync: mockAttachClusterOperator,
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
    mockContextValue.platformConfigurationData = undefined
    mockContextValue.isEngineV2SelfManaged = false
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

  it('should create the binding and attach the operator for an Engine v2 self-managed cluster', async () => {
    mockContextValue.generalData = {
      name: 'self-managed-cluster',
      description: 'description',
      cloud_provider: CloudProviderEnum.AWS,
      region: 'eu-west-3',
      installation_type: 'SELF_MANAGED',
      production: false,
      credentials: 'cred-id',
      credentials_name: 'cred-name',
    } as ClusterGeneralData
    mockContextValue.isEngineV2SelfManaged = true
    mockContextValue.platformConfigurationData = {
      templateKey: 'qovery-cluster-v0',
      templateVersion: '0.1.0',
      layerSelections: { logs: true },
      managedConfig: {},
      customerProvidedInputs: {},
    }
    mockCreateCluster.mockResolvedValue({ id: 'cluster-123' })

    const { userEvent } = renderWithProviders(<StepSummary {...defaultProps} />, { wrapper: Wrapper })
    await userEvent.click(screen.getByTestId('button-create-deploy'))

    await waitFor(() => {
      expect(mockCreateCluster).toHaveBeenCalledWith({
        organizationId: 'org-123',
        clusterRequest: expect.objectContaining({
          cloud_provider_credentials: {
            cloud_provider: CloudProviderEnum.AWS,
            credentials: { id: 'cred-id', name: 'cred-name' },
            region: 'eu-west-3',
          },
        }),
      })
      expect(mockEditCloudProviderInfo).toHaveBeenCalledWith({
        organizationId: 'org-123',
        clusterId: 'cluster-123',
        cloudProviderInfoRequest: {
          cloud_provider: CloudProviderEnum.AWS,
          credentials: { id: 'cred-id', name: 'cred-name' },
          region: 'eu-west-3',
        },
      })
      expect(mockUpdatePlatformBinding).toHaveBeenCalledWith({
        organizationId: 'org-123',
        clusterId: 'cluster-123',
        request: mockContextValue.platformConfigurationData,
      })
      expect(mockAttachClusterOperator).toHaveBeenCalledWith({
        organizationId: 'org-123',
        clusterId: 'cluster-123',
      })
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/organization/$organizationId/cluster/$clusterId/overview',
        params: { organizationId: 'org-123', clusterId: 'cluster-123' },
        search: { 'show-self-managed-guide': true },
      })
    })
    expect(mockUpdatePlatformBinding.mock.invocationCallOrder[0]).toBeLessThan(
      mockAttachClusterOperator.mock.invocationCallOrder[0]
    )
  })

  it('should send GCP NAT_GATEWAY using nat_gateway_type format on create', async () => {
    mockContextValue.generalData = {
      name: 'test-gcp-cluster',
      description: 'description',
      cloud_provider: CloudProviderEnum.GCP,
      region: 'europe-west1',
      installation_type: 'MANAGED',
      production: false,
      credentials: 'cred-id',
      credentials_name: 'cred-name',
    }
    mockContextValue.featuresData = {
      vpc_mode: 'DEFAULT',
      features: {
        STATIC_IP: {
          id: 'STATIC_IP',
          title: 'Static IP / Nat Gateways',
          value: true,
        },
        NAT_GATEWAY: {
          id: 'NAT_GATEWAY',
          title: 'NAT Gateway',
          value: true,
          extendedValue: {
            static_ips_enabled: false,
            static_ips_count: 2,
          },
        },
      },
    }

    mockCreateCluster.mockResolvedValue({ id: 'cluster-123' })
    mockEditCloudProviderInfo.mockResolvedValue({})

    const { userEvent } = renderWithProviders(<StepSummary {...defaultProps} />, { wrapper: Wrapper })

    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateCluster).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org-123',
          clusterRequest: expect.objectContaining({
            cloud_provider: 'GCP',
            features: expect.arrayContaining([
              expect.objectContaining({
                id: 'STATIC_IP',
                value: true,
              }),
              expect.objectContaining({
                id: 'NAT_GATEWAY',
                value: {
                  nat_gateway_type: {
                    provider: 'gcp',
                    static_ips_enabled: false,
                    static_ips_count: 2,
                  },
                },
              }),
            ]),
          }),
        })
      )
    })

    const createdClusterRequest = mockCreateCluster.mock.calls[0][0].clusterRequest
    expect(createdClusterRequest.features).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'STATIC_IP', value: true })])
    )
  })

  it('should not derive GCP STATIC_IP from NAT_GATEWAY', async () => {
    mockContextValue.generalData = {
      name: 'test-gcp-cluster',
      description: 'description',
      cloud_provider: CloudProviderEnum.GCP,
      region: 'europe-west1',
      installation_type: 'MANAGED',
      production: false,
      credentials: 'cred-id',
      credentials_name: 'cred-name',
    }
    mockContextValue.featuresData = {
      vpc_mode: 'DEFAULT',
      features: {
        STATIC_IP: {
          id: 'STATIC_IP',
          title: 'Static IP / Nat Gateways',
          value: false,
        },
        NAT_GATEWAY: {
          id: 'NAT_GATEWAY',
          title: 'NAT Gateway',
          value: true,
          extendedValue: {
            static_ips_enabled: false,
            static_ips_count: 2,
          },
        },
      },
    }

    mockCreateCluster.mockResolvedValue({ id: 'cluster-123' })
    mockEditCloudProviderInfo.mockResolvedValue({})

    const { userEvent } = renderWithProviders(<StepSummary {...defaultProps} />, { wrapper: Wrapper })

    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => expect(mockCreateCluster).toHaveBeenCalled())

    const createdClusterRequest = mockCreateCluster.mock.calls[0][0].clusterRequest
    expect(createdClusterRequest.features).toEqual([
      {
        id: 'NAT_GATEWAY',
        value: {
          nat_gateway_type: {
            provider: 'gcp',
            static_ips_enabled: false,
            static_ips_count: 2,
          },
        },
      },
    ])
  })

  it('should send GCP private nodes in existing VPC payload on create', async () => {
    mockContextValue.generalData = {
      name: 'test-gcp-cluster',
      description: 'description',
      cloud_provider: CloudProviderEnum.GCP,
      region: 'europe-west1',
      installation_type: 'MANAGED',
      production: false,
      credentials: 'cred-id',
      credentials_name: 'cred-name',
    }
    mockContextValue.featuresData = {
      vpc_mode: 'EXISTING_VPC',
      gcp_existing_vpc: {
        vpc_name: 'test-vpc',
        private_nodes: true,
        vpc_project_id: 'test-project',
        ip_range_services_name: 'services-range',
        ip_range_pods_name: 'pods-range',
        additional_ip_range_pods_names: 'pods-range-2,pods-range-3',
        subnetwork_name: 'subnet-a',
      },
      features: {},
    }

    mockCreateCluster.mockResolvedValue({ id: 'cluster-123' })
    mockEditCloudProviderInfo.mockResolvedValue({})

    const { userEvent } = renderWithProviders(<StepSummary {...defaultProps} />, { wrapper: Wrapper })

    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateCluster).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org-123',
          clusterRequest: expect.objectContaining({
            cloud_provider: 'GCP',
            features: expect.arrayContaining([
              expect.objectContaining({
                id: 'EXISTING_VPC',
                value: expect.objectContaining({
                  vpc_name: 'test-vpc',
                  private_nodes: true,
                }),
              }),
            ]),
          }),
        })
      )
    })
  })

  it('should emit default NAT_GATEWAY for GCP when only STATIC_IP is in form data', async () => {
    mockContextValue.generalData = {
      name: 'test-gcp-cluster',
      description: '',
      cloud_provider: CloudProviderEnum.GCP,
      region: 'europe-west1',
      installation_type: 'MANAGED',
      production: false,
      credentials: 'cred-id',
      credentials_name: 'cred-name',
    }
    mockContextValue.featuresData = {
      vpc_mode: 'DEFAULT',
      features: {
        STATIC_IP: { id: 'STATIC_IP', title: 'Static IP / Nat Gateways', value: true },
        // NAT_GATEWAY intentionally absent (race / quick navigation scenario)
      },
    }

    mockCreateCluster.mockResolvedValue({ id: 'cluster-123' })
    mockEditCloudProviderInfo.mockResolvedValue({})

    const { userEvent } = renderWithProviders(<StepSummary {...defaultProps} />, { wrapper: Wrapper })

    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateCluster).toHaveBeenCalledWith(
        expect.objectContaining({
          clusterRequest: expect.objectContaining({
            features: expect.arrayContaining([
              expect.objectContaining({
                id: 'NAT_GATEWAY',
                value: expect.objectContaining({
                  nat_gateway_type: expect.objectContaining({ provider: 'gcp', static_ips_enabled: false }),
                }),
              }),
            ]),
          }),
        })
      )
    })
  })

  it('should send SCW NAT_GATEWAY using nat_gateway_type format when extendedValue is string', async () => {
    mockContextValue.generalData = {
      name: 'test-scw-cluster',
      description: '',
      cloud_provider: CloudProviderEnum.SCW,
      region: 'fr-par',
      installation_type: 'MANAGED',
      production: false,
      credentials: 'cred-id',
      credentials_name: 'cred-name',
    }
    mockContextValue.featuresData = {
      vpc_mode: 'DEFAULT',
      features: {
        NAT_GATEWAY: {
          id: 'NAT_GATEWAY',
          title: 'NAT Gateway',
          value: true,
          extendedValue: 'VPC-GW-S',
        },
        STATIC_IP: {
          id: 'STATIC_IP',
          title: 'Static IP',
          value: true,
        },
      },
    }

    mockCreateCluster.mockResolvedValue({ id: 'cluster-123' })
    mockEditCloudProviderInfo.mockResolvedValue({})

    const { userEvent } = renderWithProviders(<StepSummary {...defaultProps} />, { wrapper: Wrapper })

    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateCluster).toHaveBeenCalledWith(
        expect.objectContaining({
          clusterRequest: expect.objectContaining({
            features: expect.arrayContaining([
              expect.objectContaining({
                id: 'NAT_GATEWAY',
                value: expect.objectContaining({
                  nat_gateway_type: expect.objectContaining({ provider: 'scaleway', type: 'VPC-GW-S' }),
                }),
              }),
            ]),
          }),
        })
      )
    })
  })
})
