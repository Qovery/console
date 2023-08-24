import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type JobResourcesData } from '@qovery/shared/interfaces'
import { StepResources, type StepResourcesProps } from './step-resources'

const props: StepResourcesProps = {
  onSubmit: jest.fn(),
  onBack: jest.fn(),
}

describe('Resources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<JobResourcesData>(<StepResources {...props} />, {
        defaultValues: {
          cpu: [3],
          memory: 1024,
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})
