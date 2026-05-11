import type { ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HelmCreationFlow } from '../helm-creation-flow'
import { HelmStepGeneral } from './step-general'

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  GitBranchSettings: () => <div data-testid="git-branch-settings" />,
  GitProviderSetting: () => <div data-testid="git-provider-setting" />,
  GitPublicRepositorySettings: () => <div data-testid="git-public-repository-settings" />,
  GitRepositorySetting: () => <div data-testid="git-repository-setting" />,
}))

jest.mock('../../source-setting/source-setting', () => ({
  SourceSetting: () => <div data-testid="source-setting" />,
}))

jest.mock('../../deployment-setting/deployment-setting', () => ({
  DeploymentSetting: () => <div data-testid="deployment-setting" />,
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

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
}))

const defaultProps = {
  labelSetting: <div data-testid="label-setting">Labels</div>,
  annotationSetting: <div data-testid="annotation-setting">Annotations</div>,
}

function renderStepGeneral() {
  return renderWithProviders(
    <HelmCreationFlow creationFlowUrl="/create/helm">
      <HelmStepGeneral {...defaultProps} />
    </HelmCreationFlow>
  )
}

describe('HelmStepGeneral', () => {
  it('renders the general helm form', () => {
    renderStepGeneral()

    expect(screen.getByRole('heading', { name: 'General information' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'General' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Source' })).toBeInTheDocument()
    expect(screen.getByTestId('source-setting')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('does not render extra labels section before a source is selected', () => {
    renderStepGeneral()

    expect(screen.queryByRole('heading', { name: 'Extra labels/annotations' })).not.toBeInTheDocument()
  })
})
