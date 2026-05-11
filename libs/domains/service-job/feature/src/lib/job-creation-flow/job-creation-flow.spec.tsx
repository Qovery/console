import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { JobCreationFlow, useJobCreateContext } from './job-creation-flow'

const mockNavigate = jest.fn()

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
  useSearch: () => ({}),
  useLocation: () => ({ pathname: '/organization/org-1/project/proj-1/environment/env-1/service/create/lifecycle' }),
}))

function ContextConsumer() {
  const { currentStep, jobURL, resourcesData, dockerfileForm, variableData, jobType } = useJobCreateContext()

  return (
    <div data-testid="context-consumer">
      step={currentStep} url={jobURL} memory={resourcesData?.memory} cpu={resourcesData?.cpu} dockerfileSource=
      {dockerfileForm.getValues('dockerfile_source')} variablesCount={variableData?.variables.length} jobType=
      {jobType}
    </div>
  )
}

describe('JobCreationFlow', () => {
  it('renders and provides job creation context with default values', () => {
    renderWithProviders(
      <JobCreationFlow creationFlowUrl="/create/job">
        <ContextConsumer />
      </JobCreationFlow>
    )

    expect(screen.getByText('Create new job')).toBeInTheDocument()
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('step=1')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('url=/create/job')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('memory=512')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('cpu=500')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('dockerfileSource=GIT_REPOSITORY')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('variablesCount=0')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('jobType=LIFECYCLE_JOB')
  })
})
