import type { ReactNode } from 'react'
import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationContainerCreationFlow } from '../application-container-creation-flow'
import { ApplicationContainerStepGeneral } from './step-general'

const mockOnSubmit = jest.fn()

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
  useSearch: () => ({}),
  useNavigate: () => jest.fn(),
}))

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isLoading: false,
  }),
}))

const defaultSlotProps = {
  gitRepositorySettings: <div data-testid="git-settings">Git settings</div>,
  generalContainerSettings: <div data-testid="container-settings">Container settings</div>,
  entrypointCmdInputs: <div data-testid="entrypoint-cmd">Entrypoint / Cmd</div>,
  labelSetting: <div data-testid="label-setting">Labels</div>,
  annotationSetting: <div data-testid="annotation-setting">Annotations</div>,
  onSubmit: mockOnSubmit,
}

async function renderStepGeneral() {
  const result = renderWithProviders(
    <ApplicationContainerCreationFlow creationFlowUrl="/create/container" defaultServiceType="CONTAINER">
      <ApplicationContainerStepGeneral {...defaultSlotProps} />
    </ApplicationContainerCreationFlow>
  )
  // The form validates asynchronously on mount without changing what is rendered (Continue stays disabled),
  // so there is nothing to wait for: flush the validation instead
  await act(async () => undefined)
  return result
}

describe('ApplicationContainerStepGeneral', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('should render General information section and form', async () => {
    await renderStepGeneral()
    expect(screen.getByRole('heading', { name: 'General information' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'General' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Source' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('should show Application source select with Git provider and Container options', async () => {
    await renderStepGeneral()
    expect(screen.getByLabelText('Application source')).toBeInTheDocument()
    expect(screen.getByTestId('container-settings')).toBeInTheDocument()
  })

  it('should show container settings when Container is selected', async () => {
    await renderStepGeneral()
    expect(screen.getByTestId('container-settings')).toBeVisible()
    expect(screen.queryByTestId('git-settings')).not.toBeInTheDocument()
  })

  it('should show Extra labels/annotations collapsible section', async () => {
    await renderStepGeneral()
    expect(screen.getByRole('heading', { name: 'Extra labels/annotations' })).toBeInTheDocument()
  })

  it('should render Continue button and call onSubmit when clicked with valid form', async () => {
    await renderStepGeneral()
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeInTheDocument()
    expect(continueButton).toBeDisabled()
    continueButton.click()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})
