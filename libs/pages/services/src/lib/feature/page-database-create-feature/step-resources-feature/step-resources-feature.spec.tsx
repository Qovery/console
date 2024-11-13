import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { DatabaseCreateContext } from '../page-database-create-feature'
import StepResourcesFeature from './step-resources-feature'

jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  useCloudProviderDatabaseInstanceTypes: () => ({
    data: [
      {
        name: 'db.t3.small',
      },
      {
        name: 'db.t3.medium',
      },
    ],
  }),
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
        creationFlowUrl: '/organization/1/project/2/environment/3/services/create/database',
      }}
    >
      {props.children}
    </DatabaseCreateContext.Provider>
  )
}

describe('PageDatabaseCreateResourcesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ContextWrapper>
        <StepResourcesFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit form and navigate', async () => {
    const { userEvent } = renderWithProviders(
      <ContextWrapper>
        <StepResourcesFeature />
      </ContextWrapper>
    )

    const button = screen.getByTestId('button-submit')
    await userEvent.click(button)

    expect(mockSetResourcesData).toHaveBeenCalledWith({
      storage: 1,
      cpu: [100],
      memory: 100,
    })
    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/project/2/environment/3/services/create/database/post')
  })

  it('should render resources with managed type', async () => {
    const { userEvent } = renderWithProviders(
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
            instance_type: 'db.t3.small',
          },
          setResourcesData: mockSetResourcesData,
          creationFlowUrl: '/organization/1/project/2/environment/3/services/create/database',
        }}
      >
        <StepResourcesFeature />
      </DatabaseCreateContext.Provider>
    )

    const realSelect = screen.getByLabelText('Instance type')
    await selectEvent.select(realSelect, 'db.t3.small')
    await waitFor(() => expect(screen.getAllByText('db.t3.small')).toHaveLength(1))

    expect(screen.getByText('db.t3.small')).toBeInTheDocument()

    const button = screen.getByTestId('button-submit')
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    await userEvent.click(button)

    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/project/2/environment/3/services/create/database/post')
  })
})
