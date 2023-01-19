import { act, fireEvent } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import StepGeneral, { StepGeneralProps } from './step-general'

const props: StepGeneralProps = {
  onSubmit: jest.fn(),
}

describe('StepGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<StepGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'my-cluster',
          description: 'test',
          production: false,
        },
      })
    )

    getByDisplayValue('my-cluster')
    getByDisplayValue('test')
    getByDisplayValue('false')
  })

  it('should submit the form on click', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'my-cluster',
          description: 'test',
          production: false,
        },
      })
    )

    const button = getByTestId('button-submit')

    await act(() => {
      const input = getByTestId('input-name')
      fireEvent.input(input, { target: { value: 'test' } })
    })

    await act(() => {
      button?.click()
    })

    expect(button).not.toBeDisabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
