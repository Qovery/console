import { act, waitFor } from '@testing-library/react'
import { mockUseQueryResult } from '__tests__/utils/mock-use-query-result'
import { getByTestId, render } from '__tests__/utils/setup-jest'
import {
  CloudProviderEnum,
  DatabaseAccessibilityEnum,
  DatabaseModeEnum,
  DatabaseTypeEnum,
  ManagedDatabaseInstanceTypeResponse,
} from 'qovery-typescript-axios'
import { ReactNode } from 'react'
import selectEvent from 'react-select-event'
import { DatabaseCreateContext } from '../page-database-create-feature'
import StepResourcesFeature from './step-resources-feature'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

const mockUseFetchDatabaseInstanceTypes: jest.Mock = jest.fn()
jest.mock('@qovery/domains/database', () => ({
  ...jest.requireActual('@qovery/domains/database'),
  useFetchDatabaseInstanceTypes: (provider: CloudProviderEnum, databaseType: DatabaseTypeEnum, region: string) =>
    mockUseFetchDatabaseInstanceTypes(provider, databaseType, region),
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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

describe('PageDatabaseCreateResourcesFeature', () => {
  beforeEach(() => {
    mockUseFetchDatabaseInstanceTypes.mockReturnValue(
      mockUseQueryResult<ManagedDatabaseInstanceTypeResponse[]>([
        {
          name: 'db.t3.medium',
        },
      ])
    )
  })
  it('should render successfully', () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepResourcesFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await act(() => {})

    const button = getByTestId(baseElement, 'button-submit')
    expect(button).not.toBeDisabled()

    await act(() => {
      button.click()
    })

    expect(mockSetResourcesData).toHaveBeenCalledWith({
      storage: 1,
      cpu: [100],
      memory: 100,
    })
    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/project/2/environment/3/services/create/database/post')
  })

  it('should render resources with managed type', async () => {
    const { getByTestId, getByText, getByLabelText } = render(
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
          setGeneralData: jest.fn(),
          resourcesData: {
            storage: 1,
            cpu: 100,
            memory: 100,
            instance_type: 'db.t3.medium',
          },
          setResourcesData: mockSetResourcesData,
        }}
      >
        <StepResourcesFeature />
      </DatabaseCreateContext.Provider>
    )

    const realSelect = getByLabelText('Instance type')
    await selectEvent.select(realSelect, 'db.t3.medium')

    expect(getByText('db.t3.medium')).toBeInTheDocument()

    const button = getByTestId('button-submit')

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })

    await act(() => {
      button.click()
    })

    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/project/2/environment/3/services/create/database/post')
  })
})
