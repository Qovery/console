import { act } from '@testing-library/react'
import { getByTestId, render } from '__tests__/utils/setup-jest'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { ReactNode } from 'react'
import * as storeDatabase from '@qovery/domains/database'
import { DatabaseCreateContext } from '../page-database-create-feature'
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
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3' }),
  useNavigate: () => mockNavigate,
}))

const mockSetResourcesData = jest.fn()
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
        setGeneralData: jest.fn(),
        resourcesData: {
          storage: 1,
          cpu: [100],
          memory: 100,
        },
        setResourcesData: mockSetResourcesData,
      }}
    >
      {props.children}
    </DatabaseCreateContext.Provider>
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
    const createDatabaseSpy: SpyInstance = jest.spyOn(storeDatabase, 'createDatabase')
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
      environmentId: '3',
      databaseRequest: {
        accessibility: DatabaseAccessibilityEnum.PRIVATE,
        cpu: 100000,
        memory: 100,
        mode: DatabaseModeEnum.CONTAINER,
        name: 'test',
        storage: 1,
        type: DatabaseTypeEnum.MYSQL,
        version: '1',
        description: '',
      },
    })
    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/project/2/environment/3/services')
  })
})
