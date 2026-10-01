import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DatabaseCreationFlow, useDatabaseCreateContext } from './database-creation-flow'

const mockNavigate = jest.fn()
const mockSearch: { template: string; option: string } = {
  template: 'postgresql',
  option: 'container',
}

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
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearch,
}))

function ContextConsumer() {
  const { currentStep, creationFlowUrl, generalForm, resourcesForm } = useDatabaseCreateContext()

  return (
    <div data-testid="context-consumer">
      step={currentStep} url={creationFlowUrl} type={generalForm.getValues('type')} storage=
      {resourcesForm.getValues('storage')}
    </div>
  )
}

describe('DatabaseCreationFlow', () => {
  afterEach(() => {
    mockSearch.option = 'container'
  })

  it('renders and provides database creation context', () => {
    renderWithProviders(
      <DatabaseCreationFlow creationFlowUrl="/create/database">
        <ContextConsumer />
      </DatabaseCreationFlow>
    )

    expect(screen.getByText('Create new database')).toBeInTheDocument()
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('step=1')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('url=/create/database')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('type=POSTGRESQL')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('storage=20')
  })

  it('falls back to the container flow for legacy managed links', () => {
    mockSearch.option = 'managed'

    renderWithProviders(
      <DatabaseCreationFlow creationFlowUrl="/create/database">
        <ContextConsumer />
      </DatabaseCreationFlow>
    )

    expect(screen.getByText('Create new database')).toBeInTheDocument()
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('type=POSTGRESQL')
  })
})
