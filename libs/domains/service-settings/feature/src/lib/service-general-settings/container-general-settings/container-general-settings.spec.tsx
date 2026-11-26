import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { containerFactoryMock, gitContainerFactoryMock, organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ContainerGeneralSettings } from './container-general-settings'

jest.mock('@qovery/domains/organizations/feature', () => ({
  AnnotationSetting: () => null,
  LabelSetting: () => null,
  EditGitRepositorySettings: () => <div>Git repository settings</div>,
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  AutoDeploySection: ({ source }: { source: string }) => <div>{`Auto-deploy section ${source}`}</div>,
  EntrypointCmdInputs: () => null,
  GeneralContainerSettings: () => <div>Container registry settings</div>,
  GeneralSetting: () => null,
}))

describe('ContainerGeneralSettings', () => {
  const service = containerFactoryMock(1)[0]
  const gitContainer = gitContainerFactoryMock(1)[0]
  const organization = organizationFactoryMock(1)[0]

  const renderSettings = (container = service) =>
    renderWithProviders(
      wrapWithReactHookForm(
        <ContainerGeneralSettings
          service={container}
          organization={organization}
          openContainerRegistryCreateEditModal={jest.fn()}
        />,
        {
          defaultValues: {
            name: container.name,
          },
        }
      )
    )

  it('should render main sections', () => {
    renderSettings()

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Deploy')).toBeInTheDocument()
  })

  it('should render registry settings and auto-deploy for an image container', () => {
    renderSettings()

    expect(screen.getByText('Container registry settings')).toBeInTheDocument()
    expect(screen.getByText('Auto-deploy section CONTAINER_REGISTRY')).toBeInTheDocument()
    expect(screen.queryByText('Git repository settings')).not.toBeInTheDocument()
  })

  it('should render the Git source and running image read-only for a Git container', () => {
    renderSettings(gitContainer)

    expect(screen.getByText('Git repository settings')).toBeInTheDocument()
    expect(screen.getByLabelText('Dockerfile path')).toBeDisabled()
    expect(screen.getByLabelText('Running image')).toHaveValue(`${gitContainer.image_name}:${gitContainer.tag}`)
    expect(screen.getByLabelText('Running image')).toBeDisabled()
    expect(screen.queryByLabelText('Dockerfile stage')).not.toBeInTheDocument()
    expect(screen.queryByText('Container registry settings')).not.toBeInTheDocument()
  })

  it('should render the Dockerfile stage read-only for a Git container that targets one', () => {
    renderSettings({
      ...gitContainer,
      source: {
        git_repository: {
          provider: 'GITHUB' as const,
          owner: 'qovery',
          name: 'qovery/console',
          url: 'https://github.com/qovery/console.git',
          branch: 'main',
          root_path: '/',
          dockerfile_path: 'Dockerfile',
          docker_target_build_stage: 'runtime',
        },
      },
    })

    expect(screen.getByLabelText('Dockerfile stage')).toHaveValue('runtime')
    expect(screen.getByLabelText('Dockerfile stage')).toBeDisabled()
  })

  it('should render auto-deploy on new commits for a Git container', () => {
    renderSettings(gitContainer)

    expect(screen.getByText('Auto-deploy section GIT')).toBeInTheDocument()
  })
})
