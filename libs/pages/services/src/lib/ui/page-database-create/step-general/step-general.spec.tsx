import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import StepGeneral, { StepGeneralProps } from './step-general'

const props: StepGeneralProps = {
  onSubmit: jest.fn(),
  databaseVersionOptions: {},
  databaseTypeOptions: [],
}

describe('PageDatabaseCreateGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<StepGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
