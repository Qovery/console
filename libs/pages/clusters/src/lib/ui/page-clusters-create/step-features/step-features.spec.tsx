import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum, type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StepFeatures, { type StepFeaturesProps } from './step-features'

const STATIC_IP = 'STATIC_IP'

const mockFeatures: ClusterFeatureResponse[] = [
  {
    id: STATIC_IP,
    title: 'feature-1',
    cost_per_month: 23,
    value_object: {
      type: 'STRING',
      value: 'test',
    },
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
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<StepFeatures {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepFeatures {...props} />, {
        defaultValues: {
          vpc_mode: 'DEFAULT',
          feature: {
            [STATIC_IP]: {
              value_object: {
                type: 'BOOLEAN',
                value: false,
              },
              extendedValue: 'my-value',
            },
          },
        },
      })
    )

    const input = screen.getByTestId('feature')
    await userEvent.click(input)

    // all because we have two inputs on the inputs select with search
    screen.getByDisplayValue('true')
  })

  it('should submit the form on click', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepFeatures {...props} />, {
        defaultValues: {
          vpc_mode: 'DEFAULT',
          feature: {
            [STATIC_IP]: {
              value: true,
              extendedValue: 'my-value',
            },
          },
        },
      })
    )

    const button = screen.getByTestId('button-submit')

    const input = screen.getByTestId('feature')

    await userEvent.click(input)
    await userEvent.click(button)

    expect(button).toBeEnabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
