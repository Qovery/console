import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import StepSummary, { type StepSummaryProps } from './step-summary'

const props: StepSummaryProps = {
  generalData: {
    name: 'test',
    accessibility: DatabaseAccessibilityEnum.PRIVATE,
    version: '1',
    type: DatabaseTypeEnum.MYSQL,
    mode: DatabaseModeEnum.MANAGED,
  },
  resourcesData: {
    storage: 1,
    cpu: 100,
    memory: 100,
  },
  gotoGlobalInformation: jest.fn(),
  gotoResources: jest.fn(),
  isLoadingCreate: false,
  isLoadingCreateAndDeploy: false,
  onPrevious: jest.fn(),
  onSubmit: jest.fn(),
}

describe('PageDatabaseCreatePost', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<StepSummary {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
