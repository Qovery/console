import { act, render } from '__tests__/utils/setup-jest'
import { CloudProviderEnum, type DeploymentStageResponse } from 'qovery-typescript-axios'
import { type ApplicationEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import PageSettingsDeploymentPipeline, {
  type PageSettingsDeploymentPipelineProps,
} from './page-settings-deployment-pipeline'

const onSubmit = jest.fn()
const setStages = jest.fn()
const onAddStage = jest.fn()

const menuEditStage = jest.fn()
const menuOrderStage = jest.fn()
const menuDeleteStage = jest.fn()

const menuStage = (stage: DeploymentStageResponse) => [
  {
    items: [
      {
        name: 'Edit stage',
        onClick: menuEditStage,
      },
      {
        name: 'Order stage',
        onClick: menuOrderStage,
      },
    ],
  },
  {
    items: [
      {
        name: 'Delete stage',
        onClick: menuDeleteStage,
      },
    ],
  },
]

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
  onAddStage,
  cloudProvider: CloudProviderEnum.AWS,
  menuStage: (stage: DeploymentStageResponse) => menuStage(stage),
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
    const { getByTestId } = render(
      <PageSettingsDeploymentPipeline
        onSubmit={onSubmit}
        setStages={setStages}
        onAddStage={onAddStage}
        menuStage={(stage: DeploymentStageResponse) => menuStage(stage)}
      />
    )
    getByTestId('stages-loader')
  })

  it('should have UI arrow between group', () => {
    const { getByTestId } = render(<PageSettingsDeploymentPipeline {...defaultProps} />)
    getByTestId('arrow-1')
  })

  it('should have button to add stage', async () => {
    const { getByTestId } = render(<PageSettingsDeploymentPipeline {...defaultProps} />)

    await act(() => {
      getByTestId('btn-add-stage').click()
    })

    expect(onAddStage).toBeCalled()
  })

  it('should have button to delete and edit stage', async () => {
    const { getAllByTestId } = render(<PageSettingsDeploymentPipeline {...defaultProps} />)

    const items = getAllByTestId('menuItem')

    // edit stage
    await act(() => {
      items[0].click()
    })

    // order stage
    await act(() => {
      items[1].click()
    })

    // delete stage
    await act(() => {
      items[2].click()
    })

    expect(menuEditStage).toBeCalled()
    expect(menuOrderStage).toBeCalled()
    expect(menuDeleteStage).toBeCalled()
  })

  it('should have placeholder for stage', () => {
    defaultProps.stages = [
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
        services: [],
      },
    ]

    const { getByTestId } = render(<PageSettingsDeploymentPipeline {...defaultProps} />)
    getByTestId('placeholder-stage')
  })
})
