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
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ organizationId: '1' }),
  useNavigate: () => mockNavigate,
}))

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
        },
        setGeneralData: jest.fn(),
        resourcesData: {
          cluster_type: 'MANAGED',
          instance_type: 't2.micro',
          nodes: [1, 4],
          disk_size: 20,
        },
        setResourcesData: mockSetResourcesData,
        featuresData: {
          features: [
            {
              id: 'STATIC_IP',
              value: false,
            },
          ],
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
    const createDatabaseSpy: SpyInstance = jest.spyOn(storeCluster, 'createCluster')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {
            id: '1',
            environment: {
              id: '2',
            },
          },
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

    expect(createDatabaseSpy).toHaveBeenCalledWith({
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
        disk_size: 20,
        features: [
          {
            id: 'STATIC_IP',
            value: false,
          },
        ],
      },
    })
    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/clusters')
  })
})
