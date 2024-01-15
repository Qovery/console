import { act, getByTestId, render } from '__tests__/utils/setup-jest'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { DatabaseCreateContext } from '../page-database-create-feature'
import StepGeneralFeature from './step-general-feature'

const mockSetGeneralData = jest.fn()
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3' }),
  useNavigate: () => mockNavigate,
}))

const ContextWrapper = (props: { children: ReactNode }) => {
  return (
    <DatabaseCreateContext.Provider
      value={{
        currentStep: 1,
        setCurrentStep: jest.fn(),
        generalData: {
          name: 'test',
          accessibility: DatabaseAccessibilityEnum.PRIVATE,
          version: '1',
          type: DatabaseTypeEnum.MYSQL,
          mode: DatabaseModeEnum.CONTAINER,
        },
        setGeneralData: mockSetGeneralData,
        resourcesData: undefined,
        setResourcesData: jest.fn(),
      }}
    >
      {props.children}
    </DatabaseCreateContext.Provider>
  )
}

describe('StepGeneralFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepGeneralFeature />
      </ContextWrapper>
    )

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await act(() => {})
    expect(baseElement).toBeTruthy()
  })

  it('should submit form and navigate', async () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepGeneralFeature />
      </ContextWrapper>
    )

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await act(() => {})

    const button = getByTestId(baseElement, 'button-submit')
    expect(button).not.toBeDisabled()

    await act(() => {
      button.click()
    })

    expect(mockSetGeneralData).toHaveBeenCalledWith({
      name: 'test',
      accessibility: DatabaseAccessibilityEnum.PRIVATE,
      version: '1',
      type: DatabaseTypeEnum.MYSQL,
      mode: DatabaseModeEnum.CONTAINER,
    })
    expect(mockNavigate).toHaveBeenCalledWith(
      '/organization/1/project/2/environment/3/services/create/database/resources'
    )
  })
})
