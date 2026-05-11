import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { DatabaseStepSummary } from './step-summary'

const mockNavigate = jest.fn()
const mockSetCurrentStep = jest.fn()
const mockCreateService = jest.fn()
const mockDeployService = jest.fn()
const mockCapture = jest.fn()
const mockUseDatabaseCreateContext = jest.fn()

const baseContextValue = {
  creationFlowUrl: '/organization/org-1/project/proj-1/environment/env-1/service/create/database',
  setCurrentStep: mockSetCurrentStep,
  generalForm: {
    getValues: () => ({
      name: 'postgres',
      accessibility: DatabaseAccessibilityEnum.PRIVATE,
      mode: DatabaseModeEnum.MANAGED,
      type: DatabaseTypeEnum.POSTGRESQL,
      version: '16',
    }),
  },
  resourcesForm: {
    getValues: () => ({
      storage: 20,
      instance_type: 'db.t3.small',
    }),
  },
}

jest.mock('posthog-js', () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
  useSearch: () => ({
    template: 'postgresql',
    option: 'managed',
  }),
  useNavigate: () => mockNavigate,
}))

jest.mock('../../../hooks/use-create-service/use-create-service', () => ({
  useCreateService: () => ({ mutateAsync: mockCreateService }),
}))

jest.mock('../../../hooks/use-deploy-service/use-deploy-service', () => ({
  useDeployService: () => ({ mutateAsync: mockDeployService }),
}))

jest.mock('../database-creation-flow', () => ({
  databaseCreationSteps: [{ title: 'Create new database' }, { title: 'Set resources' }, { title: 'Ready to install' }],
  useDatabaseCreateContext: () => mockUseDatabaseCreateContext(),
}))

jest.mock('../database-summary-view/database-summary-view', () => ({
  DatabaseSummaryView: ({ onSubmit }: { onSubmit: (withDeploy: boolean) => void }) => (
    <div>
      <h1>Ready to create your Database</h1>
      <button data-testid="button-create" type="button" onClick={() => onSubmit(false)}>
        Create
      </button>
      <button data-testid="button-create-deploy" type="button" onClick={() => onSubmit(true)}>
        Create and deploy
      </button>
    </div>
  ),
}))

function setup() {
  mockUseDatabaseCreateContext.mockReturnValue(baseContextValue)
  return renderWithProviders(<DatabaseStepSummary labelsGroup={[]} annotationsGroup={[]} />)
}

describe('DatabaseStepSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDatabaseCreateContext.mockReturnValue(baseContextValue)
    mockCreateService.mockResolvedValue({ id: 'database-1' })
    mockDeployService.mockResolvedValue(undefined)
  })

  it('creates the database and navigates to overview', async () => {
    const { userEvent } = setup()

    expect(mockSetCurrentStep).toHaveBeenCalledWith(3)
    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateService).toHaveBeenCalledWith({
        environmentId: 'env-1',
        payload: expect.objectContaining({
          serviceType: 'DATABASE',
          name: 'postgres',
          instance_type: 'db.t3.small',
        }),
      })
    })

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: {
        organizationId: 'org-1',
        projectId: 'proj-1',
        environmentId: 'env-1',
      },
    })
    expect(mockCapture).toHaveBeenCalledWith('create-service', {
      selectedServiceType: 'postgresql',
      selectedServiceSubType: 'managed',
    })
  })

  it('deploys after create when create and deploy is clicked', async () => {
    const { userEvent } = setup()

    await userEvent.click(screen.getByTestId('button-create-deploy'))

    await waitFor(() => {
      expect(mockDeployService).toHaveBeenCalledWith({
        serviceId: 'database-1',
        serviceType: 'DATABASE',
      })
    })
  })
})
