import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StepSummary, { type StepSummaryProps } from './step-summary'

const STATIC_IP = 'STATIC_IP'

const props: StepSummaryProps = {
  generalData: {
    name: 'test',
    description: 'description',
    production: true,
    cloud_provider: CloudProviderEnum.AWS,
    region: 'region',
    credentials: '1',
    credentials_name: 'name',
    installation_type: 'MANAGED',
  },
  resourcesData: {
    cluster_type: 'MANAGED',
    instance_type: 't2.micro',
    nodes: [1, 4],
    disk_size: 50,
  },
  featuresData: {
    vpc_mode: 'DEFAULT',
    features: {
      [STATIC_IP]: {
        id: 'STATIC_IP',
        value: true,
      },
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
    renderWithProviders(wrapWithReactHookForm(<StepSummary {...props} />))

    screen.getByTestId('summary-general')
    screen.getByTestId('summary-resources')
    screen.getByTestId('summary-features')
    screen.getByTestId('summary-remote')
  })
})
