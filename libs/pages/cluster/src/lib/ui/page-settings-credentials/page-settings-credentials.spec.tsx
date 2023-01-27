import { waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import PageSettingsGeneral, { PageSettingsCredentialsProps } from './page-settings-credentials'

describe('PageSettingsGeneral', () => {
  const props: PageSettingsCredentialsProps = {
    onSubmit: jest.fn((e) => e.preventDefault()),
    loading: false,
  }

  const defaultValues = {
    name: 'hello-world',
    description: 'desc',
    production: true,
  }

  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    getByDisplayValue('hello-world')
    getByDisplayValue('desc')
    getByDisplayValue('true')
  })

  it('should submit the form', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const button = getByTestId('submit-button')

    await waitFor(() => {
      button.click()
      expect(props.onSubmit).toHaveBeenCalled()
    })
  })
})
