import { act, findByTestId, render, waitFor } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
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
  })

  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with docker section', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues(),
      })
    )

    let name: any, buildMode: any, dockerfile: any
    await act(async () => {
      name = await findByTestId(baseElement, 'input-name')
      buildMode = await findByTestId(baseElement, 'input-select-mode')
      dockerfile = await findByTestId(baseElement, 'input-text-dockerfile')
    })
    expect(name.getAttribute('value')).toBe('hello-world')
    expect(buildMode.querySelector('.input__value')?.textContent).toContain(upperCaseFirstLetter(BuildModeEnum.DOCKER))
    expect(dockerfile.getAttribute('value')).toBe('Dockerfile')
  })

  it('should render the form with buildpack section', async () => {
    props.watchBuildMode = BuildModeEnum.BUILDPACKS

    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues(BuildModeEnum.BUILDPACKS),
      })
    )

    let name: any, buildMode: any, language: any
    await act(async () => {
      name = await findByTestId(baseElement, 'input-name')
      buildMode = await findByTestId(baseElement, 'input-select-mode')
      language = await findByTestId(baseElement, 'input-select-language')
    })
    expect(name.getAttribute('value')).toBe('hello-world')
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

    const button = await findByTestId(baseElement, 'submit-button')

    await waitFor(() => {
      button.click()
      expect(spy).toHaveBeenCalled()
    })
  })
})
