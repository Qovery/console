import { act } from '@testing-library/react'
import { getByTestId, render } from '__tests__/utils/setup-jest'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { ReactNode } from 'react'
import * as storeCluster from '@qovery/domains/organization'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepSummaryFeature from './step-summary-feature'

import SpyInstance = jest.SpyInstance

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

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
  it('should render successfully', () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepSummaryFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should post the request with expected form values', async () => {
    const createClusterSpy: SpyInstance = jest.spyOn(storeCluster, 'createCluster')
    const postCloudProviderInfoSpy: SpyInstance = jest.spyOn(storeCluster, 'postCloudProviderInfo')

    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))
    const { baseElement } = render(
      <ContextWrapper>
        <StepSummaryFeature />
      </ContextWrapper>
    )

    const button = getByTestId(baseElement, 'button-create-deploy')

    await act(() => {
      button.click()
    })

    expect(createClusterSpy).toHaveBeenCalledWith({
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

    expect(postCloudProviderInfoSpy).toHaveBeenCalledWith({
      organizationId: '1',
      clusterId: undefined,
      clusterCloudProviderInfo: {
        cloud_provider: CloudProviderEnum.AWS,
        credentials: {
          id: '1',
          name: 'name',
        },
        region: 'region',
      },
      silently: true,
    })
  })
})
