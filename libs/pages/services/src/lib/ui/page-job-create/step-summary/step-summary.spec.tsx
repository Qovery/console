import { render } from '__tests__/utils/setup-jest'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { StepSummary, type StepSummaryProps } from './step-summary'

const props: StepSummaryProps = {
  variableData: {
    variables: [],
  },
  generalData: {
    name: 'test',
    description: 'test',
    serviceType: ServiceTypeEnum.CONTAINER,
    auto_deploy: false,
  },
  configureData: {
    event: 'test',
    cmd_arguments: 'test',
    cmd: ['test'],
    schedule: 'test',
    nb_restarts: 1,
    port: 3000,
    image_entry_point: '/',
    max_duration: 1,
  },
  gotoGlobalInformation: jest.fn(),
  gotoResources: jest.fn(),
  gotoVariables: jest.fn(),
  isLoadingCreate: false,
  isLoadingCreateAndDeploy: false,
  onPrevious: jest.fn(),
  onSubmit: jest.fn(),
  resourcesData: {
    cpu: [3],
    memory: 1024,
  },
  selectedRegistryName: 'test',
}

describe('Post', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepSummary {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
