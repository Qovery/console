import { act, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import StepFeatures, { StepFeaturesProps } from './step-features'

const STATIC_IP = 'STATIC_IP'

const mockFeatures = [
  {
    id: STATIC_IP,
    title: 'feature-1',
    cost_per_month: 23,
    value: 'my-value',
    accepted_values: ['test', 'my-value'],
  },
]

const props: StepFeaturesProps = {
  onSubmit: jest.fn(),
  cloudProvider: CloudProviderEnum.AWS,
  features: mockFeatures,
}

describe('StepFeatures', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<StepFeatures {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields', async () => {
    const { getByDisplayValue, getAllByDisplayValue } = render(
      wrapWithReactHookForm(<StepFeatures {...props} />, {
        defaultValues: {
          [STATIC_IP]: {
            value: true,
            extendedValue: 'my-value',
          },
        },
      })
    )

    getByDisplayValue('true')
    // all because we have two inputs on the inputs select with search
    getAllByDisplayValue('my-value')
  })

  it('should submit the form on click', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<StepFeatures {...props} />, {
        defaultValues: {
          [STATIC_IP]: {
            value: true,
            extendedValue: 'my-value',
          },
        },
      })
    )

    const button = getByTestId('button-submit')

    await act(() => {
      const input = getByTestId('feature')
      input.click()
    })

    await act(() => {
      button?.click()
    })

    expect(button).not.toBeDisabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
