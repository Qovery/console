import type { ReactNode } from 'react'
import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationContainerCreationFlow } from './application-container-creation-flow'
import { ApplicationContainerStepResources } from './step-resources'

const mockOnSubmit = jest.fn()

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
    slug: 'my-app',
  }),
  useSearch: () => ({}),
  useNavigate: () => jest.fn(),
}))

jest.mock('../../application-settings-resources/application-settings-resources', () => ({
  ApplicationSettingsResources: () => <div data-testid="application-settings-resources">Resources form</div>,
}))

describe('ApplicationContainerStepResources', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('should render resources step and form content', async () => {
    renderWithProviders(
      <ApplicationContainerCreationFlow creationFlowUrl="/create/container" defaultServiceType="CONTAINER">
        <ApplicationContainerStepResources onSubmit={mockOnSubmit} />
      </ApplicationContainerCreationFlow>
    )
    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument()
    await act(async () => {
      expect(screen.getByTestId('application-settings-resources')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })
})
