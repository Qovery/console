import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageProjectGeneral, { type PageProjectGeneralProps } from './page-project-general'

describe('PageProjectGeneral', () => {
  const props: PageProjectGeneralProps = {
    onSubmit: jest.fn((e) => e.preventDefault()),
    loading: false,
  }

  const defaultValues = {
    name: 'hello',
    description: 'hello world',
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<PageProjectGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render inputs', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<PageProjectGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )
    expect(screen.getByTestId('input-name')).toBeInTheDocument()
  })

  it('should submit the form', async () => {
    defaultValues.name = ''

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageProjectGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const button = screen.getByTestId('submit-button')
    const inputName = screen.getByTestId('input-name')

    expect(button).toBeDisabled()
    await userEvent.type(inputName, 'hello world')

    await userEvent.click(button)
    expect(button).toBeEnabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
