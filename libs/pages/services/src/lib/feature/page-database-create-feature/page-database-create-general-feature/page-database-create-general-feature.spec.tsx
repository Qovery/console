import { act, waitFor } from '@testing-library/react'
import { getByTestId, render } from '__tests__/utils/setup-jest'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { ReactNode } from 'react'
import { DatabaseCreateContext } from '../page-database-create-feature'
import PageDatabaseCreateGeneralFeature from './page-database-create-general-feature'

const mockSetGeneralData = jest.fn()
const mockNavigate = jest.fn()

jest.mock('@qovery/domains/environment', () => ({
  ...jest.requireActual('@qovery/domains/environment'),
  fetchDatabaseConfiguration: jest.fn(),
}))

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3' }),
  useNavigate: () => mockNavigate,
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
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

describe('PageDatabaseCreateGeneralFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = render(
      <ContextWrapper>
        <PageDatabaseCreateGeneralFeature />
      </ContextWrapper>
    )

    await act(() => {})
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

    button.click()

    await waitFor(() => {
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
})
