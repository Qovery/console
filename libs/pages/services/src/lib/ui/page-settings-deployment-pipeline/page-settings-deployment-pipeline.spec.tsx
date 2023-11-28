import { CloudProviderEnum, type DeploymentStageResponse } from 'qovery-typescript-axios'
import { type ApplicationEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
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
    const { baseElement } = renderWithProviders(<PageSettingsDeploymentPipeline {...defaultProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should PageSettingsDeploymentPipeline component without errors', () => {
    const { getByText } = renderWithProviders(<PageSettingsDeploymentPipeline {...defaultProps} />)

    expect(getByText('Stage 1')).toBeInTheDocument()
    expect(getByText('Stage 2')).toBeInTheDocument()
    expect(getByText('Service 1')).toBeInTheDocument()
    expect(getByText('Database 2')).toBeInTheDocument()
    expect(getByText('Application 3')).toBeInTheDocument()
  })

  it('should have loading component', () => {
    renderWithProviders(
      <PageSettingsDeploymentPipeline
        onSubmit={onSubmit}
        setStages={setStages}
        onAddStage={onAddStage}
        menuStage={(stage: DeploymentStageResponse) => menuStage(stage)}
      />
    )
    screen.getByTestId('stages-loader')
  })

  it('should have UI arrow between group', () => {
    renderWithProviders(<PageSettingsDeploymentPipeline {...defaultProps} />)
    screen.getByTestId('arrow-1')
  })

  it('should have button to add stage', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsDeploymentPipeline {...defaultProps} />)

    await userEvent.click(screen.getByTestId('btn-add-stage'))

    expect(onAddStage).toBeCalled()
  })

  it('should have button to delete and edit stage', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsDeploymentPipeline {...defaultProps} />)
    const actions = screen.getAllByTestId('btn-more-menu')

    await userEvent.click(actions[0])

    const items = screen.getAllByTestId('menuItem')

    // edit stage
    await userEvent.click(items[0])

    // order stage
    await userEvent.click(items[1])

    await userEvent.click(actions[1])

    const items2 = screen.getAllByTestId('menuItem')
    // delete stage
    await userEvent.click(items2[2])

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

    renderWithProviders(<PageSettingsDeploymentPipeline {...defaultProps} />)
    screen.getByTestId('placeholder-stage')
  })
})
