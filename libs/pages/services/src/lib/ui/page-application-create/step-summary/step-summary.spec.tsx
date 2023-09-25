import { render } from '__tests__/utils/setup-jest'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import StepSummary, { type StepSummaryProps } from './step-summary'

const props: StepSummaryProps = {
  gotoResources: jest.fn(),
  resourcesData: {
    cpu: [0.5],
    instances: [1, 12],
    memory: 512,
  },
  gotoGlobalInformation: jest.fn(),
  generalData: {
    serviceType: ServiceTypeEnum.APPLICATION,
    name: 'test',
    auto_deploy: false,
  },
  gotoPorts: jest.fn(),
  onPrevious: jest.fn(),
  onSubmit: jest.fn(),
  portsData: {
    ports: [
      {
        application_port: 80,
        external_port: 443,
        is_public: true,
      },
    ],
  },
  isLoadingCreate: false,
  isLoadingCreateAndDeploy: false,
}

describe('StepSummary', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepSummary {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
