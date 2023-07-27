import { fireEvent, getByLabelText, getByTestId, render, waitFor } from '__tests__/utils/setup-jest'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { ReactNode } from 'react'
import selectEvent from 'react-select-event'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepResourcesFeature from './step-resources-feature'

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

jest.mock('@qovery/domains/organization', () => ({
  ...jest.requireActual('@qovery/domains/organization'),
  fetchAvailableInstanceTypes: jest.fn(),
  selectInstancesTypes: () => mockInstanceType,
}))

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

const mockSetResourceData = jest.fn()

const ContextWrapper = (props: { children: ReactNode }) => {
  return (
    <ClusterContainerCreateContext.Provider
      value={{
        currentStep: 1,
        setCurrentStep: jest.fn(),
        generalData: {
          name: 'test',
          description: 'hello',
          production: false,
          region: 'us-east-1',
          cloud_provider: CloudProviderEnum.AWS,
          credentials: '1',
          credentials_name: 'name',
        },
        setGeneralData: jest.fn(),
        setResourcesData: mockSetResourceData,
        resourcesData: {
          instance_type: 't2.medium',
          disk_size: 50,
          cluster_type: 'MANAGED',
          nodes: [1, 3],
        },
        remoteData: undefined,
        featuresData: undefined,
        setRemoteData: jest.fn(),
        setFeaturesData: jest.fn(),
      }}
    >
      {props.children}
    </ClusterContainerCreateContext.Provider>
  )
}

describe('StepResourcesFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  mockDispatch.mockImplementation(() => ({
    unwrap: () =>
      Promise.resolve({
        results: [...mockInstanceType],
      }),
  }))

  it('should submit form and navigate', async () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepResourcesFeature />
      </ContextWrapper>
    )

    const select = getByLabelText(baseElement, 'Instance type')
    await selectEvent.select(select, 't2.small (1CPU - 2GB RAM - arm64)', {
      container: document.body,
    })

    const diskSize = getByLabelText(baseElement, 'Disk size (GB)')
    fireEvent.input(diskSize, { target: { value: '22' } })

    const button = getByTestId(baseElement, 'button-submit')
    button.click()

    await waitFor(() => {
      expect(button).not.toBeDisabled()
      expect(mockSetResourceData).toBeCalledWith({
        instance_type: 't2.small',
        disk_size: '22',
        cluster_type: 'MANAGED',
        nodes: [1, 3],
      })
    })
  })
})
