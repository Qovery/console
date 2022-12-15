import ResizeObserver from '__tests__/utils/resize-observer'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { JobResourcesData } from '../../../feature/page-job-create-feature/job-creation-flow.interface'
import Resources, { ResourcesProps } from './resources'

const props: ResourcesProps = {
  onSubmit: jest.fn(),
  onBack: jest.fn(),
}

describe('Resources', () => {
  it('should render successfully', () => {
    window.ResizeObserver = ResizeObserver
    const { baseElement } = render(
      wrapWithReactHookForm<JobResourcesData>(<Resources {...props} />, {
        defaultValues: {
          cpu: [3],
          memory: 1024,
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})
