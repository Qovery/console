import { act } from '@testing-library/react'
import { getByTestId, render } from '__tests__/utils/setup-jest'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { ReactNode } from 'react'
import { DatabaseCreateContext } from '../page-database-create-feature'
import PageDatabaseCreateGeneralFeature from './page-database-create-general-feature'

const mockSetGeneralData = jest.fn()
const mockNavigate = jest.fn()

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
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
          mode: DatabaseModeEnum.MANAGED,
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

describe('PageDatabaseCreateGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ContextWrapper>
        <PageDatabaseCreateGeneralFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit form and navigate', async () => {
    const { baseElement } = render(
      <ContextWrapper>
        <PageDatabaseCreateGeneralFeature />
      </ContextWrapper>
    )

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
      mode: DatabaseModeEnum.MANAGED,
    })
    expect(mockNavigate).toHaveBeenCalled()
  })
})
