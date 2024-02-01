import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { clusterFactoryMock } from '@qovery/shared/factories'
import StepGeneral, { type StepGeneralProps } from './step-general'

const mockCluster = clusterFactoryMock(1)[0]

const props: StepGeneralProps = {
  onSubmit: jest.fn(),
  databaseVersionOptions: {},
  databaseTypeOptions: [],
  cluster: mockCluster,
}

describe('PageDatabaseCreateGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<StepGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
