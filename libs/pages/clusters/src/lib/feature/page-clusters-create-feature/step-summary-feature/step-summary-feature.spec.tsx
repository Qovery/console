import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepSummaryFeature, { getValueByKey } from './step-summary-feature'

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
const ContextWrapper = (props: { installation_type?: 'MANAGED' | 'SELF_MANAGED'; children: ReactNode }) => {
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
          installation_type: props.installation_type ?? 'MANAGED',
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
          vpc_mode: 'DEFAULT',
          features: {
            STATIC_IP: {
              id: STATIC_IP,
              value: true,
              extendedValue: 'test',
            },
          },
        },
        setFeaturesData: jest.fn(),
        kubeconfigData: {
          file_content: 'file_content',
          file_size: 1234,
          file_name: 'file_name.yml',
        },
        setKubeconfigData: jest.fn(),
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
    const { baseElement } = renderWithProviders(
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
    const { userEvent } = renderWithProviders(
      <ContextWrapper>
        <StepSummaryFeature />
      </ContextWrapper>
    )

    await userEvent.click(screen.getByTestId('button-create-deploy'))

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
        cloud_provider_credentials: {
          cloud_provider: CloudProviderEnum.AWS,
          credentials: {
            id: '1',
            name: 'name',
          },
          region: 'region',
        },
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

  it('should post the request with expected form values - self managed', async () => {
    createCluster.mockReturnValue({
      id: '42',
    })
    const { userEvent } = renderWithProviders(
      <ContextWrapper installation_type="SELF_MANAGED">
        <StepSummaryFeature />
      </ContextWrapper>
    )

    await userEvent.click(screen.getByTestId('button-create'))

    expect(createCluster).toHaveBeenCalledWith({
      organizationId: '1',
      clusterRequest: {
        name: 'test',
        description: 'description',
        production: true,
        cloud_provider: CloudProviderEnum.AWS,
        cloud_provider_credentials: {
          cloud_provider: 'AWS',
          credentials: {
            id: '1',
            name: 'name',
          },
          region: 'region',
        },
        region: 'region',
        kubernetes: 'SELF_MANAGED',
        ssh_keys: [],
        features: [],
      },
    })
  })

  it('should return correct values for different scenarios', () => {
    // Test case 1: Empty data
    expect(getValueByKey('key', [])).toEqual([])

    // Test case 2: Key not found in any object
    const data1 = [{ a: '1' }, { b: '2' }, { c: '3' }]
    expect(getValueByKey('key', data1)).toEqual([])

    // Test case 3: Empty key
    const data2 = [
      { a: '1', key: 'value1' },
      { b: '2', key: 'value2' },
      { c: '3', key: 'value3' },
    ]
    expect(getValueByKey('', data2)).toEqual([])
  })
})
