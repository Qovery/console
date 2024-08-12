import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsGeneral, { type PageSettingsGeneralProps } from './page-settings-general'

describe('PageSettingsGeneral', () => {
  const props: PageSettingsGeneralProps = {
    cluster: clusterFactoryMock(1)[0],
    onSubmit: jest.fn((e) => e.preventDefault()),
    loading: false,
  }

  const defaultValues = {
    name: 'hello-world',
    description: 'desc',
    production: true,
  }

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<PageSettingsGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    screen.getByDisplayValue('hello-world')
    screen.getByDisplayValue('desc')
    screen.getByDisplayValue('true')
  })

  it('should submit the form', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const button = await screen.findByTestId('submit-button')
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    await userEvent.click(button)
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
