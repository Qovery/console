import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsGeneral, { type PageSettingsGeneralProps } from './page-settings-general'

describe('PageSettingsGeneral', () => {
  const props: PageSettingsGeneralProps = {
    database: databaseFactoryMock(1)[0],
    onSubmit: jest.fn((e) => e.preventDefault()),
    loading: false,
  }

  const defaultValues = {
    name: 'hello-world',
    type: DatabaseTypeEnum.POSTGRESQL,
    mode: DatabaseModeEnum.CONTAINER,
    accessibility: DatabaseAccessibilityEnum.PUBLIC,
    version: '12',
    cpu: 512,
    memory: 1024,
  }

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues,
      })
    )
    // https://react-hook-form.com/advanced-usage#TransformandParse
    const button = await screen.findByRole('button', { name: /save/i })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)
    expect(spy).toHaveBeenCalled()
  })
})
