import { getByTestId, screen, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum, BuildPackLanguageEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { upperCaseFirstLetter } from '@console/shared/utils'
import PageSettingsGeneral, { PageSettingsGeneralProps } from './page-settings-general'

describe('PageSettingsGeneral', () => {
  const props: PageSettingsGeneralProps = {
    watchBuildMode: BuildModeEnum.DOCKER,
    onSubmit: jest.fn((e) => e.preventDefault()),
  }

  const defaultValues = (mode = BuildModeEnum.DOCKER) => ({
    name: 'hello-world',
    build_mode: mode,
    buildpack_language: BuildPackLanguageEnum.CLOJURE,
    dockerfile_path: 'Dockerfile',
    provider: GitProviderEnum.GITHUB,
    repository: 'qovery/console',
    branch: 'main',
    root_path: '/',
  })

  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with docker section', async () => {
    render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues(),
      })
    )

    const buildMode = screen.getByTestId('input-select-mode')
    const dockerfile = screen.getByTestId('input-text-dockerfile')

    screen.getByDisplayValue('hello-world')
    expect(buildMode.querySelector('.input__value')?.textContent).toContain(upperCaseFirstLetter(BuildModeEnum.DOCKER))
    expect(dockerfile.getAttribute('value')).toBe('Dockerfile')
  })

  it('should render the form with buildpack section', () => {
    props.watchBuildMode = BuildModeEnum.BUILDPACKS

    render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues(BuildModeEnum.BUILDPACKS),
      })
    )

    const buildMode = screen.getByTestId('input-select-mode')
    const language = screen.getByTestId('input-select-language')

    screen.getByDisplayValue('hello-world')
    expect(buildMode.querySelector('.input__value')?.textContent).toContain(
      upperCaseFirstLetter(BuildModeEnum.BUILDPACKS)
    )
    expect(language.querySelector('.input__value')?.textContent).toContain(
      upperCaseFirstLetter(BuildPackLanguageEnum.CLOJURE)
    )
  })

  it('should submit the form', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues(),
      })
    )

    const button = getByTestId(baseElement, 'submit-button')

    await waitFor(() => {
      button.click()
      expect(spy).toHaveBeenCalled()
    })
  })
})
