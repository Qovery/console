import { act, fireEvent, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import PageProjectGeneral, { PageProjectGeneralProps } from './page-project-general'

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
    const { baseElement } = render(
      wrapWithReactHookForm(<PageProjectGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render inputs', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<PageProjectGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )
    await act(() => {
      expect(getByTestId('input-name')).toBeInTheDocument()
    })
  })

  it('should submit the form', async () => {
    defaultValues.name = ''

    const { getByTestId } = render(
      wrapWithReactHookForm(<PageProjectGeneral {...props} />, {
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
