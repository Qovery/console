import { act, getByTestId, render } from '__tests__/utils/setup-jest'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepSummaryFeature from './step-summary-feature'

const useCreateClusterMockSpy = jest.spyOn(clustersDomain, 'useCreateCluster') as jest.Mock
const useEditCloudProviderInfoMockSpy = jest.spyOn(clustersDomain, 'useEditCloudProviderInfo') as jest.Mock
const useCloudProviderInstanceTypesMockSpy = jest.spyOn(
  cloudProvidersDomain,
  'useCloudProviderInstanceTypes'
) as jest.Mock

const mockInstanceType = [
  {
    name: 't2.micro',
    cpu: 1,
    ram_in_gb: 1,
    type: 't2.micro',
    architecture: 'arm64',
  },
  {
    name: 't2.small',
    cpu: 1,
    ram_in_gb: 2,
    type: 't2.small',
    architecture: 'arm64',
  },
  {
    name: 't2.medium',
    cpu: 2,
    ram_in_gb: 4,
    type: 't2.medium',
    architecture: 'x86_64',
  },
]

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
  useNavigate: () => mockNavigate,
}))

const STATIC_IP = 'STATIC_IP'

const mockSetResourcesData = jest.fn()
const ContextWrapper = (props: { children: ReactNode }) => {
  return (
    <ClusterContainerCreateContext.Provider
      value={{
        currentStep: 1,
        setCurrentStep: jest.fn(),
        generalData: {
          name: 'test',
          description: 'description',
          production: true,
          cloud_provider: CloudProviderEnum.AWS,
          region: 'region',
          credentials: '1',
          credentials_name: 'name',
        },
        setGeneralData: jest.fn(),
        resourcesData: {
          cluster_type: 'MANAGED',
          instance_type: 't2.micro',
          nodes: [1, 4],
          disk_size: 50,
        },
        setResourcesData: mockSetResourcesData,
        remoteData: {
          ssh_key: 'ssh_key',
        },
        setRemoteData: jest.fn(),
        featuresData: {
          [STATIC_IP]: {
            id: STATIC_IP,
            value: true,
            extendedValue: 'test',
          },
        },
        setFeaturesData: jest.fn(),
      }}
    >
      {props.children}
    </ClusterContainerCreateContext.Provider>
  )
}

describe('StepSummaryFeature', () => {
  const createCluster = jest.fn()
  const editCloudProviderInfo = jest.fn()
  beforeEach(() => {
    useCreateClusterMockSpy.mockReturnValue({
      mutateAsync: createCluster,
    })
    useEditCloudProviderInfoMockSpy.mockReturnValue({
      mutateAsync: editCloudProviderInfo,
    })
    useCloudProviderInstanceTypesMockSpy.mockReturnValue({
      data: mockInstanceType,
      isLoading: false,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepSummaryFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should post the request with expected form values', async () => {
    createCluster.mockReturnValue({
      id: '42',
    })
    const { baseElement } = render(
      <ContextWrapper>
        <StepSummaryFeature />
      </ContextWrapper>
    )

    const button = getByTestId(baseElement, 'button-create-deploy')

    await act(() => {
      button.click()
    })

    expect(createCluster).toHaveBeenCalledWith({
      organizationId: '1',
      clusterRequest: {
        name: 'test',
        description: 'description',
        production: true,
        cloud_provider: CloudProviderEnum.AWS,
        region: 'region',
        min_running_nodes: 1,
        max_running_nodes: 4,
        kubernetes: 'MANAGED',
        instance_type: 't2.micro',
        disk_size: 50,
        ssh_keys: ['ssh_key'],
        features: [
          {
            id: STATIC_IP,
            value: 'test',
          },
        ],
      },
    })

    expect(editCloudProviderInfo).toHaveBeenCalledWith({
      organizationId: '1',
      clusterId: '42',
      cloudProviderInfoRequest: {
        cloud_provider: CloudProviderEnum.AWS,
        credentials: {
          id: '1',
          name: 'name',
        },
        region: 'region',
      },
    })
  })
})
