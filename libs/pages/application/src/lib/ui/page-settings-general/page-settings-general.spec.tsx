import { act, getByTestId, screen, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum, BuildPackLanguageEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import PageSettingsGeneral, { PageSettingsGeneralProps } from './page-settings-general'

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
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with docker section', async () => {
    render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValuesApplication(),
      })
    )

    screen.getByDisplayValue('hello-world')
    screen.getByText('Docker')
    screen.getByDisplayValue('Dockerfile')
  })

  it('should render the form with buildpack section', () => {
    props.watchBuildMode = BuildModeEnum.BUILDPACKS

    render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValuesApplication(BuildModeEnum.BUILDPACKS),
      })
    )

    screen.getByDisplayValue('hello-world')
    screen.getByText('Buildpacks')
    screen.getByText('Clojure')
  })

  it('should render the form with container settings', async () => {
    props.type = ServiceTypeEnum.CONTAINER

    render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValuesContainer(),
      })
    )

    await act(() => {
      screen.getByDisplayValue('hello-world')
      screen.getByDisplayValue('image_name')
      screen.getByDisplayValue('image_tag')
      screen.getByDisplayValue('image_entry_point')
      screen.getByDisplayValue('cmd_arguments')
    })
  })

  it('should submit the form', async () => {
    props.type = ServiceTypeEnum.APPLICATION
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValuesApplication(),
      })
    )

    const button = getByTestId(baseElement, 'submit-button')

    await waitFor(() => {
      button.click()
      expect(spy).toHaveBeenCalled()
    })
  })
})
