import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StepResources, { type StepResourcesProps } from './step-resources'

const props: StepResourcesProps = {
  onBack: jest.fn(),
  onSubmit: jest.fn(),
}

describe('StepResources', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<StepResources {...props} />, {
        defaultValues: {
          memory: 1024,
          cpu: 500,
          min_running_instances: 1,
          max_running_instances: 12,
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepResources {...props} />, {
        defaultValues: {
          memory: 1024,
          cpu: 500,
          min_running_instances: 1,
          max_running_instances: 12,
        },
      })
    )

    // https://react-hook-form.com/advanced-usage#TransformandParse
    const button = await screen.findByRole('button', { name: /continue/i })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
