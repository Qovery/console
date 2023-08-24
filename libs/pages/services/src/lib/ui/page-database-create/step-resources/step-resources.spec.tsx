import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import StepResources, { type StepResourcesProps } from './step-resources'

const props: StepResourcesProps = {
  onSubmit: jest.fn(),
  onBack: jest.fn(),
}

describe('PageDatabaseCreateResources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<StepResources {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
