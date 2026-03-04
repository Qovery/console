import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AutoDeploySetting } from './auto-deploy-setting'

describe('AutoDeploySetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<AutoDeploySetting source="GIT" />))
    expect(baseElement).toMatchSnapshot()
  })

  it('shows title "Auto-deploy on new commits" for GIT source', () => {
    renderWithProviders(wrapWithReactHookForm(<AutoDeploySetting source="GIT" />))
    expect(screen.getByText('Auto-deploy on new commits')).toBeInTheDocument()
  })

  it('shows title "Auto-deploy on new commits" for TERRAFORM source', () => {
    renderWithProviders(wrapWithReactHookForm(<AutoDeploySetting source="TERRAFORM" />))
    expect(screen.getByText('Auto-deploy on new commits')).toBeInTheDocument()
  })

  it('shows title "Auto-deploy on new image tag" for CONTAINER_REGISTRY source', () => {
    renderWithProviders(wrapWithReactHookForm(<AutoDeploySetting source="CONTAINER_REGISTRY" />))
    expect(screen.getByText('Auto-deploy on new image tag')).toBeInTheDocument()
  })

  it('does not show any description', () => {
    renderWithProviders(wrapWithReactHookForm(<AutoDeploySetting source="GIT" />))
    expect(screen.queryByText(/automatically updated on every new commit/i)).not.toBeInTheDocument()
  })

  it('renders titleSuffix next to the title', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <AutoDeploySetting source="TERRAFORM" titleSuffix={<span data-testid="suffix">badge</span>} />
      )
    )
    expect(screen.getByTestId('suffix')).toBeInTheDocument()
  })
})
