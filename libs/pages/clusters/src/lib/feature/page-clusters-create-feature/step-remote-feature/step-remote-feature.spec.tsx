import { act, fireEvent, getByLabelText, getByTestId, render } from '__tests__/utils/setup-jest'
import { type ReactNode } from 'react'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepRemoteFeature from './step-remote-feature'

const mockSetRemoteData = jest.fn()
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
  useNavigate: () => mockNavigate,
}))

const ContextWrapper = (props: { children: ReactNode }) => {
  return (
    <ClusterContainerCreateContext.Provider
      value={{
        currentStep: 1,
        setCurrentStep: jest.fn(),
        remoteData: {
          ssh_key: 'ssh key',
        },
        setRemoteData: mockSetRemoteData,
        generalData: undefined,
        setGeneralData: jest.fn(),
        resourcesData: undefined,
        setResourcesData: jest.fn(),
      }}
    >
      {props.children}
    </ClusterContainerCreateContext.Provider>
  )
}

describe('StepRemoteFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepRemoteFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit form and navigate', async () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepRemoteFeature />
      </ContextWrapper>
    )

    await act(() => {
      const input = getByLabelText(baseElement, 'SSH Key')
      fireEvent.input(input, { target: { value: 'test' } })
    })

    const button = getByTestId(baseElement, 'button-submit')
    expect(button).toBeEnabled()

    await act(() => {
      button.click()
    })

    expect(mockSetRemoteData).toHaveBeenCalledWith({
      ssh_key: 'test',
    })
  })
})
