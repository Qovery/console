import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import StepSummary, { StepSummaryProps } from './step-summary'

const STATIC_IP = 'STATIC_IP'

const props: StepSummaryProps = {
  generalData: {
    name: 'test',
    description: 'description',
    production: true,
    cloud_provider: CloudProviderEnum.AWS,
    region: 'region',
    credentials: '1',
  },
  resourcesData: {
    cluster_type: 'MANAGED',
    instance_type: 't2.micro',
    nodes: [1, 4],
    disk_size: 20,
  },
  featuresData: {
    [STATIC_IP]: {
      id: 'STATIC_IP',
      value: true,
    },
  },
  remoteData: {
    ssh_key: 'ssh_key',
  },
  goToFeatures: jest.fn(),
  goToGeneral: jest.fn(),
  goToResources: jest.fn(),
  goToRemote: jest.fn(),
  isLoadingCreate: false,
  isLoadingCreateAndDeploy: false,
  onPrevious: jest.fn(),
  onSubmit: jest.fn(),
}

describe('StepSummary', () => {
  it('should render successfully', () => {
    const { baseElement, getByTestId } = render(wrapWithReactHookForm(<StepSummary {...props} />))

    getByTestId('summary-general')
    getByTestId('summary-resources')
    getByTestId('summary-features')
    getByTestId('summary-remote')

    expect(baseElement).toBeTruthy()
  })
})
