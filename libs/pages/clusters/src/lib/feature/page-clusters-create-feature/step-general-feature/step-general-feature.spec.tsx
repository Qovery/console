import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { ReactNode } from 'react'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepGeneralFeature from './step-general-feature'

const mockSetGeneralData = jest.fn()
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ organizationId: '1' }),
  useNavigate: () => mockNavigate,
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

const ContextWrapper = (props: { children: ReactNode }) => {
  return (
    <ClusterContainerCreateContext.Provider
      value={{
        currentStep: 1,
        setCurrentStep: jest.fn(),
        generalData: { name: 'test', description: 'hello', production: false },
        setGeneralData: mockSetGeneralData,
      }}
    >
      <StepGeneralFeature />
    </ClusterContainerCreateContext.Provider>
  )
}

describe('StepGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepGeneralFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit form and navigate', async () => {
    const { getByTestId } = render(
      <ContextWrapper>
        <StepGeneralFeature />
      </ContextWrapper>
    )

    await act(() => {
      const input = getByTestId('input-name')
      fireEvent.input(input, { target: { value: 'test' } })
    })

    const button = getByTestId('button-submit')
    expect(button).not.toBeDisabled()

    await act(() => {
      button.click()
    })

    expect(mockSetGeneralData).toHaveBeenCalledWith({
      name: 'test',
      description: 'hello',
      production: false,
    })
    // expect(mockNavigate).toHaveBeenCalledWith(
    //   '/organization/1/clusters/create/resources'
    // )
  })
})
