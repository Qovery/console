import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type AnyService } from '@qovery/domains/services/data-access'
import { containerFactoryMock, databaseFactoryMock, gitContainerFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageSettingsPreviewEnvironments, SettingsPreviewEnvironmentsFeature } from './settings-preview-environments'

const mockDeploymentRule = { id: 'rule-1', auto_preview: false, on_demand_preview: false }

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1', projectId: 'proj-1', environmentId: 'env-1' }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useEditService: () => ({ mutateAsync: jest.fn() }),
  useServices: () => ({ data: [] }),
}))

jest.mock('../hooks/use-deployment-rule/use-deployment-rule', () => ({
  useDeploymentRule: () => ({ isFetched: true, data: mockDeploymentRule }),
}))

jest.mock('../hooks/use-edit-deployment-rule/use-edit-deployment-rule', () => ({
  useEditDeploymentRule: () => ({ mutateAsync: jest.fn() }),
}))

const imageContainer = { ...containerFactoryMock(1)[0], id: 'image-container' }
const gitContainer = { ...gitContainerFactoryMock(1)[0], id: 'git-container' }
const argoCdService = {
  id: 'argocd-service',
  name: 'ArgoCD service',
  service_type: 'ARGOCD_APP',
  serviceType: 'ARGOCD_APP',
} as AnyService
const agenticWorkflowService = {
  id: 'agentic-workflow',
  name: 'Review pull requests',
  service_type: 'AGENTIC_WORKFLOW',
  serviceType: 'AGENTIC_WORKFLOW',
} as AnyService

describe('PageSettingsPreviewEnvironments', () => {
  const renderPage = (services: AnyService[] = [imageContainer, gitContainer]) =>
    renderWithProviders(
      wrapWithReactHookForm(
        <PageSettingsPreviewEnvironments
          onSubmit={jest.fn()}
          services={services}
          loading={false}
          toggleAll={jest.fn()}
          toggleEnablePreview={jest.fn()}
        />,
        { defaultValues: { auto_preview: false, on_demand_preview: false } }
      )
    )

  it('should keep the preview toggle enabled for an image container', () => {
    renderPage()

    expect(screen.getByTestId('toggle-image-container')).toBeEnabled()
  })

  it('should enable the preview toggle for a Git container', () => {
    renderPage()

    expect(screen.getByTestId('toggle-git-container')).toBeEnabled()
  })

  it('should explain that a preview environment follows new commits only with auto-deploy enabled', () => {
    renderPage()

    expect(
      screen.getByText(
        'A preview environment follows new commits on its pull request only for services with auto-deploy enabled.'
      )
    ).toBeInTheDocument()
  })

  it('should hide the services title and the auto-deploy note when only databases are listed', () => {
    renderPage(databaseFactoryMock(1))

    expect(screen.queryByTestId('services-title')).not.toBeInTheDocument()
    expect(screen.queryByText(/only for services with auto-deploy enabled/)).not.toBeInTheDocument()
  })

  it.each([
    ['ArgoCD', argoCdService],
    ['Agentic Workflow', agenticWorkflowService],
  ])('should hide the auto-deploy note when only %s services are listed', (_, service) => {
    renderPage([service])

    expect(screen.getByTestId('services-title')).toBeInTheDocument()
    expect(screen.queryByText(/only for services with auto-deploy enabled/)).not.toBeInTheDocument()
  })
})

describe('SettingsPreviewEnvironmentsFeature', () => {
  it('should turn on previews for every service, Git containers included', async () => {
    const services = [imageContainer, gitContainer]
    const { userEvent } = renderWithProviders(<SettingsPreviewEnvironmentsFeature services={services} />)

    await userEvent.click(screen.getByTestId('toggle-all'))

    expect(screen.getByTestId('toggle-image-container')).toBeChecked()
    expect(screen.getByTestId('toggle-git-container')).toBeChecked()
  })
})
