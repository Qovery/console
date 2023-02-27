import { render } from '__tests__/utils/setup-jest'
import { CloudProviderEnum, DeploymentStageResponse } from 'qovery-typescript-axios'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import PageSettingsDeploymentPipeline, {
  PageSettingsDeploymentPipelineProps,
} from './page-settings-deployment-pipeline'

const onSubmit = jest.fn()
const setStages = jest.fn()

const stages: DeploymentStageResponse[] = [
  {
    id: '1',
    name: 'Stage 1',
    deployment_order: 0,
    created_at: '',
    environment: {
      id: '1',
    },
    services: [
      { id: '1', created_at: '', service_id: '1' },
      { id: '2', created_at: '', service_id: '2' },
    ],
  },
  {
    id: '2',
    name: 'Stage 2',
    deployment_order: 1,
    created_at: '',
    environment: {
      id: '1',
    },
    services: [{ id: '3', created_at: '', service_id: '3' }],
  },
]

const services: (DatabaseEntity | ApplicationEntity)[] = [
  { id: '1', created_at: '', name: 'Service 1' },
  { id: '2', created_at: '', name: 'Database 2' },
  { id: '3', created_at: '', name: 'Application 3' },
]

const defaultProps: PageSettingsDeploymentPipelineProps = {
  onSubmit,
  setStages,
  stages,
  services,
  cloudProvider: CloudProviderEnum.AWS,
  menuStage: () => [],
}

describe('PageSettingsDeploymentPipeline', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDeploymentPipeline {...defaultProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should PageSettingsDeploymentPipeline component without errors', () => {
    const { getByText } = render(<PageSettingsDeploymentPipeline {...defaultProps} />)

    expect(getByText('Stage 1')).toBeInTheDocument()
    expect(getByText('Stage 2')).toBeInTheDocument()
    expect(getByText('Service 1')).toBeInTheDocument()
    expect(getByText('Database 2')).toBeInTheDocument()
    expect(getByText('Application 3')).toBeInTheDocument()
  })

  it('should have loading component', () => {
    const { getByTestId } = render(<PageSettingsDeploymentPipeline onSubmit={onSubmit} setStages={setStages} />)
    getByTestId('stages-loader')
  })

  it('should have UI arrow between group', () => {
    const { getByTestId } = render(<PageSettingsDeploymentPipeline {...defaultProps} />)
    getByTestId('arrow-1')
  })
})
