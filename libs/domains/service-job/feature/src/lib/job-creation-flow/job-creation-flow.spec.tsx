import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HelmCreationFlow, useHelmCreateContext } from './helm-creation-flow'

const mockNavigate = jest.fn()
const mockSearch = {
  template: 'kubecost',
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
  const { currentStep, creationFlowUrl, generalForm, valuesOverrideFileForm, valuesOverrideArgumentsForm } =
    useHelmCreateContext()

  return (
    <div data-testid="context-consumer">
      step={currentStep} url={creationFlowUrl} name={generalForm.getValues('name')} icon=
      {generalForm.getValues('icon_uri')} valuesType={valuesOverrideFileForm.getValues('type')} argumentsCount=
      {valuesOverrideArgumentsForm.getValues('arguments').length}
    </div>
  )
}

describe('HelmCreationFlow', () => {
  it('renders and provides helm creation context', () => {
    renderWithProviders(
      <HelmCreationFlow creationFlowUrl="/create/helm">
        <ContextConsumer />
      </HelmCreationFlow>
    )

    expect(screen.getByText('General data')).toBeInTheDocument()
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('step=1')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('url=/create/helm')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('name=kubecost')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('icon=app://qovery-console/kubecost')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('valuesType=NONE')
    expect(screen.getByTestId('context-consumer')).toHaveTextContent('argumentsCount=0')
  })
})
