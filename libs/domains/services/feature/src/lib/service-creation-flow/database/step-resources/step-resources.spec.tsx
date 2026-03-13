import { CloudProviderEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DatabaseCreationFlow, useDatabaseCreateContext } from '../database-creation-flow'
import { DatabaseStepResources } from './step-resources'

const mockOnBack = jest.fn()
const mockOnSubmit = jest.fn()

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

function GeneralInitializer({ mode }: { mode: DatabaseModeEnum }) {
  const { generalForm } = useDatabaseCreateContext()

  useEffect(() => {
    generalForm.setValue('name', 'postgres', { shouldValidate: true })
    generalForm.setValue('type', DatabaseTypeEnum.POSTGRESQL, { shouldValidate: true })
    generalForm.setValue('mode', mode, { shouldValidate: true })
  }, [generalForm, mode])

  return null
}

describe('DatabaseStepResources', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders container resource inputs and submits default values', async () => {
    const { userEvent } = renderWithProviders(
      <DatabaseCreationFlow creationFlowUrl="/create/database">
        <GeneralInitializer mode={DatabaseModeEnum.CONTAINER} />
        <DatabaseStepResources
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          cloudProvider={CloudProviderEnum.AWS}
          instanceTypeOptions={[{ label: 'db.t3.small', value: 'db.t3.small' }]}
        />
      </DatabaseCreationFlow>
    )

    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument()
    expect(screen.getByLabelText('vCPU (milli)')).toBeInTheDocument()
    expect(screen.getByLabelText('Memory (MiB)')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        cpu: 500,
        memory: 512,
        storage: 20,
      })
    )
  })

  it('renders managed database instance type input', () => {
    renderWithProviders(
      <DatabaseCreationFlow creationFlowUrl="/create/database">
        <GeneralInitializer mode={DatabaseModeEnum.MANAGED} />
        <DatabaseStepResources
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          cloudProvider={CloudProviderEnum.AWS}
          instanceTypeOptions={[{ label: 'db.t3.small', value: 'db.t3.small' }]}
        />
      </DatabaseCreationFlow>
    )

    expect(screen.getByLabelText('Instance type')).toBeInTheDocument()
    expect(screen.getByLabelText('Storage (GiB)')).toBeInTheDocument()
  })
})
