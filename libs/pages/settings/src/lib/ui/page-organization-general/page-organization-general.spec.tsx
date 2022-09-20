import { act, fireEvent, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import PageOrganizationGeneral, { PageOrganizationGeneralProps } from './page-organization-general'

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
    const { baseElement } = render(
      wrapWithReactHookForm(<PageOrganizationGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render inputs', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<PageOrganizationGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )
    await act(() => {
      expect(getByTestId('input-file')).toBeInTheDocument()
      expect(getByTestId('input-name')).toBeInTheDocument()
      expect(getByTestId('input-area')).toBeInTheDocument()
      expect(getByTestId('input-website')).toBeInTheDocument()
      expect(getByTestId('input-emails')).toBeInTheDocument()
    })
  })

  it('should submit the form', async () => {
    defaultValues.name = ''

    const { getByTestId } = render(
      wrapWithReactHookForm(<PageOrganizationGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const button = getByTestId('submit-button')
    const inputName = getByTestId('input-name')

    await act(() => {
      expect(button).toBeDisabled()
      fireEvent.input(inputName, { target: { value: 'hello world' } })
    })

    await waitFor(() => {
      button.click()
      expect(button).not.toBeDisabled()
      expect(props.onSubmit).toHaveBeenCalled()
    })
  })
})
