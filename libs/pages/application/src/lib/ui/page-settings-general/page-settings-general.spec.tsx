import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum, BuildPackLanguageEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import PageSettingsGeneral, { type PageSettingsGeneralProps } from './page-settings-general'

describe('PageSettingsGeneral', () => {
  const props: PageSettingsGeneralProps = {
    watchBuildMode: BuildModeEnum.DOCKER,
    onSubmit: jest.fn((e) => e.preventDefault()),
    type: ServiceTypeEnum.APPLICATION,
  }

  const defaultValuesApplication = (mode = BuildModeEnum.DOCKER) => ({
    name: 'hello-world',
    description: 'desc',
    build_mode: mode,
    buildpack_language: BuildPackLanguageEnum.CLOJURE,
    dockerfile_path: 'Dockerfile',
    provider: GitProviderEnum.GITHUB,
    repository: 'qovery/console',
    branch: 'main',
    root_path: '/',
  })

  const defaultValuesContainer = () => ({
    name: 'hello-world',
    description: 'desc',
    buildpack_language: BuildPackLanguageEnum.CLOJURE,
    dockerfile_path: 'Dockerfile',
    provider: GitProviderEnum.GITHUB,
    repository: 'qovery/console',
    branch: 'main',
    root_path: '/',
    registry: 'registry',
    image_name: 'image_name',
    image_tag: 'image_tag',
    image_entry_point: 'image_entry_point',
    image_command: 'image_command',
    cmd_arguments: 'cmd_arguments',
  })

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<PageSettingsGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with docker section', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValuesApplication(),
      })
    )

    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(await screen.findByRole('button', { name: /save/i })).toBeInTheDocument()

    screen.getByDisplayValue('hello-world')
    screen.getByText('Docker')
    screen.getByDisplayValue('Dockerfile')
    screen.getByText(/The service will be automatically updated on every new commit on the branch./i)
  })

  it('should render the form with buildpack section', async () => {
    props.watchBuildMode = BuildModeEnum.BUILDPACKS

    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValuesApplication(BuildModeEnum.BUILDPACKS),
      })
    )

    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(await screen.findByRole('button', { name: /save/i })).toBeInTheDocument()

    screen.getByDisplayValue('hello-world')
    screen.getByText('Buildpacks')
    screen.getByText('Clojure')
    screen.getByText(/The service will be automatically updated on every new commit on the branch./i)
  })

  it('should render the form with container settings', async () => {
    props.type = ServiceTypeEnum.CONTAINER

    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValuesContainer(),
      })
    )

    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(await screen.findByRole('button', { name: /save/i })).toBeInTheDocument()
    screen.getByDisplayValue('hello-world')
    screen.getByDisplayValue('image_name')
    screen.getByDisplayValue('image_tag')
    screen.getByDisplayValue('image_entry_point')
    screen.getByDisplayValue('cmd_arguments')
    screen.getByText(
      /The service will be automatically updated if Qovery is notified on the API that a new image tag is available./i
    )
  })

  it('should submit the form', async () => {
    props.type = ServiceTypeEnum.APPLICATION
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValuesApplication(),
      })
    )

    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(await screen.findByRole('button', { name: /save/i })).toBeInTheDocument()
    const button = screen.getByTestId('submit-button')

    await userEvent.click(button)

    waitFor(() => {
      expect(spy).toHaveBeenCalled()
    })
  })
})
