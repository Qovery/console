import { DatabaseAccessibilityEnum, type DatabaseConfiguration, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  type DatabaseCreateGeneralData,
  type DatabaseCreateResourcesData,
} from '../database-create-utils/database-create-utils'
import {
  DatabaseCreateContext,
  type DatabaseCreateContextInterface,
  defaultDatabaseResourcesData,
} from '../database-creation-flow'
import { DatabaseStepGeneral } from './step-general'

const mockOnSubmit = jest.fn()
const mockSetCurrentStep = jest.fn()
const mockSearch = {
  template: 'postgresql',
  option: 'container',
}

const databaseConfigurations = [
  {
    database_type: 'POSTGRESQL',
    version: [
      { name: '16', supported_mode: 'CONTAINER' },
      { name: '15', supported_mode: 'MANAGED' },
    ],
  },
  {
    database_type: 'MONGODB',
    version: [
      { name: '6.0', supported_mode: 'CONTAINER' },
      { name: '5.0', supported_mode: 'MANAGED' },
    ],
  },
] as DatabaseConfiguration[]

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Link: ({ children, as: As = 'a', ...props }: { children?: ReactNode; as?: string; [key: string]: unknown }) =>
    As === 'button' ? (
      <button type="button" {...props}>
        {children}
      </button>
    ) : (
      <a {...props}>{children}</a>
    ),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
  useNavigate: () => jest.fn(),
  useSearch: () => mockSearch,
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
      name: '',
      description: '',
      accessibility: DatabaseAccessibilityEnum.PRIVATE,
      icon_uri: 'app://qovery-console/postgresql',
      type: DatabaseTypeEnum.POSTGRESQL,
      version: '',
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
    currentStep: 1,
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
  databaseConfigurationsValue = databaseConfigurations,
}: {
  generalValues?: Partial<DatabaseCreateGeneralData>
  resourcesValues?: Partial<DatabaseCreateResourcesData>
  databaseConfigurationsValue?: DatabaseConfiguration[]
} = {}) {
  return renderWithProviders(
    <TestProvider generalValues={generalValues} resourcesValues={resourcesValues}>
      <DatabaseStepGeneral
        onSubmit={mockOnSubmit}
        labelSetting={<div data-testid="label-setting">Labels</div>}
        annotationSetting={<div data-testid="annotation-setting">Annotations</div>}
        databaseConfigurations={databaseConfigurationsValue}
      />
    </TestProvider>
  )
}

describe('DatabaseStepGeneral', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders successfully with database sections', () => {
    renderComponent()

    expect(screen.getByRole('heading', { name: 'PostgreSQL - Container' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Database configuration' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('submits the form when required values are present', async () => {
    renderComponent({
      generalValues: {
        name: 'postgres',
        type: DatabaseTypeEnum.POSTGRESQL,
        version: '16',
        accessibility: DatabaseAccessibilityEnum.PRIVATE,
      },
    })
    ;(document.querySelector('form') as HTMLFormElement).requestSubmit()

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'postgres',
          type: DatabaseTypeEnum.POSTGRESQL,
          version: '16',
        })
      )
    })
  })

  it('does not render a database mode selector', () => {
    renderComponent()

    expect(screen.queryByRole('heading', { name: 'Database mode' })).not.toBeInTheDocument()
    expect(screen.queryByText('Managed mode')).not.toBeInTheDocument()
  })

  it('includes MongoDB in the database type options', async () => {
    const { userEvent } = renderComponent()

    const typeSelect = screen.getByLabelText('Database type')
    await userEvent.click(typeSelect)

    expect(screen.getByRole('option', { name: 'MongoDB' })).toBeInTheDocument()
  })
})
