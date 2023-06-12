import { act } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import StepHealthchecks, { StepHealthchecksProps } from './step-healthchecks'

const props: StepHealthchecksProps = {
  onBack: jest.fn(),
  onSubmit: jest.fn(),
}

describe('StepHealthchecks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<StepHealthchecks {...props} />, {
        defaultValues: {
          memory: 1024,
          cpu: [1],
          instances: [1, 12],
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<StepHealthchecks {...props} />, {
        defaultValues: {
          memory: 1024,
          cpu: [1],
          instances: [1, 12],
        },
      })
    )

    const button = getByTestId('button-submit')
    // wait one cycle that the button becomes enabled
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await act(() => {})

    await act(() => {
      button.click()
    })

    expect(button).not.toBeDisabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
