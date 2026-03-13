import { CloudProviderEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { type DatabaseCreateGeneralData, type DatabaseCreateResourcesData } from '../database-create-utils'
import {
  DatabaseCreateContext,
  type DatabaseCreateContextInterface,
  defaultDatabaseResourcesData,
} from '../database-creation-flow'
import { DatabaseStepResources } from './step-resources'

const mockOnBack = jest.fn()
const mockOnSubmit = jest.fn()
const mockSetCurrentStep = jest.fn()

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
  useNavigate: () => jest.fn(),
  useSearch: () => ({}),
}))

interface TestProviderProps {
  children: ReactNode
  generalValues?: Partial<DatabaseCreateGeneralData>
  resourcesValues?: Partial<DatabaseCreateResourcesData>
}

function TestProvider({ children, generalValues, resourcesValues }: TestProviderProps) {
  const generalForm = useForm<DatabaseCreateGeneralData>({
    mode: 'onChange',
    defaultValues: {
      name: 'postgres',
      accessibility: 'PRIVATE',
      icon_uri: 'app://qovery-console/postgresql',
      type: DatabaseTypeEnum.POSTGRESQL,
      mode: DatabaseModeEnum.CONTAINER,
      version: '16',
      labels_groups: [],
      annotations_groups: [],
      ...generalValues,
    },
  })

  const resourcesForm = useForm<DatabaseCreateResourcesData>({
    mode: 'onChange',
    defaultValues: {
      ...defaultDatabaseResourcesData,
      ...resourcesValues,
    },
  })

  const value: DatabaseCreateContextInterface = {
    currentStep: 2,
    setCurrentStep: mockSetCurrentStep,
    creationFlowUrl: '/organization/org-1/project/proj-1/environment/env-1/service/create/database',
    generalForm,
    resourcesForm,
  }

  return <DatabaseCreateContext.Provider value={value}>{children}</DatabaseCreateContext.Provider>
}

function renderComponent({
  generalValues,
  resourcesValues,
}: {
  generalValues?: Partial<DatabaseCreateGeneralData>
  resourcesValues?: Partial<DatabaseCreateResourcesData>
} = {}) {
  return renderWithProviders(
    <TestProvider generalValues={generalValues} resourcesValues={resourcesValues}>
      <DatabaseStepResources
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
        cloudProvider={CloudProviderEnum.AWS}
        instanceTypeOptions={[{ label: 'db.t3.small', value: 'db.t3.small' }]}
      />
    </TestProvider>
  )
}

describe('DatabaseStepResources', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders container resource inputs and submits default values', async () => {
    renderComponent({
      generalValues: {
        mode: DatabaseModeEnum.CONTAINER,
      },
    })

    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument()
    expect(screen.getByLabelText('vCPU (milli)')).toBeInTheDocument()
    expect(screen.getByLabelText('Memory (MiB)')).toBeInTheDocument()
    ;(document.querySelector('form') as HTMLFormElement).requestSubmit()

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          cpu: 500,
          memory: 512,
          storage: 20,
        })
      )
    })
  })

  it('renders managed database instance type input', () => {
    renderComponent({
      generalValues: {
        mode: DatabaseModeEnum.MANAGED,
      },
    })

    expect(screen.getByLabelText('Instance type')).toBeInTheDocument()
    expect(screen.getByLabelText('Storage (GiB)')).toBeInTheDocument()
  })
})
