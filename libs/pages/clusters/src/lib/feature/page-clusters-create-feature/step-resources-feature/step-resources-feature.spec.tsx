import { fireEvent, getByLabelText, getByTestId, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { ReactNode } from 'react'
import selectEvent from 'react-select-event'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepResourcesFeature from './step-resources-feature'

const mockInstanceType = [
  {
    label: 't2.micro (1CPU - 1GB RAM)',
    value: 't2.micro',
  },
  {
    label: 't2.small (1CPU - 2GB RAM)',
    value: 't2.small',
  },
  {
    label: 't2.medium (2CPU - 4GB RAM)',
    value: 't2.medium',
  },
]

jest.mock('@qovery/shared/console-shared', () => ({
  ...jest.requireActual('@qovery/shared/console-shared'),
  listInstanceTypeFormatter: jest.fn().mockImplementation((a: any) => {
    return mockInstanceType
  }),
}))

jest.mock('@qovery/domains/organization', () => ({
  ...jest.requireActual('@qovery/domains/organization'),
  fetchAvailableInstanceTypes: jest.fn().mockImplementation(() => ({
    unwrap: () =>
      Promise.resolve({
        data: mockInstanceType,
      }),
  })),
}))

const mockDispatch = jest.fn().mockImplementation(() => ({
  unwrap: () =>
    Promise.resolve({
      data: {},
    }),
}))

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
        },
        setGeneralData: jest.fn(),
        setResourcesData: mockSetResourceData,
        resourcesData: {
          instance_type: 't3.medium',
          disk_size: 20,
          cluster_type: 'MANAGED',
          nodes: [1, 3],
        },
      }}
    >
      {props.children}
    </ClusterContainerCreateContext.Provider>
  )
}

describe('StepResourcesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepResourcesFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit form and navigate', async () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepResourcesFeature />
      </ContextWrapper>
    )

    const select = getByLabelText(baseElement, 'Instance type')
    selectEvent.select(select, mockInstanceType[1].label, {
      container: document.body,
    })

    const diskSize = getByLabelText(baseElement, 'Disk size (GB)')
    fireEvent.input(diskSize, { target: { value: '22' } })

    await waitFor(() => {
      const button = getByTestId(baseElement, 'submit-button')
      button.click()
      expect(button).not.toBeDisabled()
      expect(mockSetResourceData).toBeCalled()
    })
  })
})
