import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOrganizationGeneral, { type PageOrganizationGeneralProps } from './page-organization-general'

describe('PageOrganizationGeneral', () => {
  const props: PageOrganizationGeneralProps = {
    onSubmit: jest.fn((e) => e.preventDefault()),
    loading: false,
    created_at: new Date().toString(),
  }

  const defaultValues = {
    logo_url: 'https://qovery.com',
    name: 'hello',
    description: 'hello world',
    website_url: 'https://qovery.com',
    admin_emails: ['test@test.com', 'test2@test.com'],
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<PageOrganizationGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render inputs', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<PageOrganizationGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )
    expect(screen.getByTestId('input-file')).toBeInTheDocument()
    expect(screen.getByTestId('input-name')).toBeInTheDocument()
    expect(screen.getByTestId('input-area')).toBeInTheDocument()
    expect(screen.getByTestId('input-website')).toBeInTheDocument()
    expect(screen.getByTestId('input-emails')).toBeInTheDocument()
  })

  it('should submit the form', async () => {
    defaultValues.name = ''

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageOrganizationGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const button = await screen.findByTestId('submit-button')
    const inputName = screen.getByTestId('input-name')

    expect(button).toBeDisabled()
    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'hello world')

    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    await userEvent.click(button)

    expect(props.onSubmit).toHaveBeenCalled()
  })
})
