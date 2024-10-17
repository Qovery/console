import { useServices } from '@qovery/domains/services/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentStages, EnvironmentStagesProps } from './environment-stages'

jest.mock('@qovery/domains/services/feature', () => ({
  useServices: jest.fn(),
  ServiceAvatar: () => <div data-testid="service-avatar" />,
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ versionId: 'version-1' }),
}))

const mockProps: EnvironmentStagesProps = {
  environment: {
    id: 'env-1',
    name: 'Test Environment',
    organization: { id: 'org-1' },
    project: { id: 'proj-1' },
    cloud_provider: {
      provider: 'AWS',
    },
  },
  environmentStatus: {
    id: 'status-1',
    state: 'RUNNING',
  },
  deploymentStages: [
    {
      stage: {
        id: 'stage-1',
        name: 'Stage 1',
        status: 'DONE',
        steps: { total_duration_sec: 120 },
      },
      applications: [
        {
          id: 'app-1',
          name: 'App 1',
          state: 'RUNNING',
          is_part_last_deployment: true,
          steps: { total_duration_sec: 60 },
        },
        {
          id: 'app-2',
          name: 'App 2',
          state: 'BUILDING',
          is_part_last_deployment: false,
        },
      ],
      databases: [],
      containers: [],
      jobs: [],
      helms: [],
    },
  ],
  preCheckStage: {
    status: 'DONE',
    total_duration_sec: 30,
  },
}

describe('EnvironmentStages', () => {
  beforeEach(() => {
    ;(useServices as jest.Mock).mockReturnValue({
      data: [
        { id: 'app-1', name: 'App 1' },
        { id: 'app-2', name: 'App 2' },
      ],
    })
  })

  it('renders loader when environmentStatus is not provided', () => {
    renderWithProviders(<EnvironmentStages {...mockProps} environmentStatus={undefined} />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('renders pre-check stage when provided', () => {
    renderWithProviders(<EnvironmentStages {...mockProps} />)
    expect(screen.getByText('Pre-check')).toBeInTheDocument()
    // expect(screen.getByText('0m 30s')).toBeInTheDocument()
  })

  it('renders deployment stages', () => {
    renderWithProviders(<EnvironmentStages {...mockProps} />)
    expect(screen.getByText('Stage 1')).toBeInTheDocument()
    expect(screen.getByText('App 1')).toBeInTheDocument()
    expect(screen.getByText('2m 0s')).toBeInTheDocument()
    expect(screen.getByText('1m 0s')).toBeInTheDocument()
  })

  it('hides skipped services when checkbox is checked', async () => {
    const { userEvent, debug } = renderWithProviders(<EnvironmentStages {...mockProps} />)

    expect(screen.getByText('App 1')).toBeInTheDocument()
    expect(screen.getByText('App 2')).toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Hide skipped'))

    expect(screen.getByText('App 1')).toBeInTheDocument()
    expect(screen.queryByText('App 2')).not.toBeInTheDocument()
  })

  it('displays placeholder when stage has no services', () => {
    const propsWithEmptyStage = {
      ...mockProps,
      deploymentStages: [
        {
          ...mockProps.deploymentStages![0],
          applications: [],
        },
      ],
    }

    renderWithProviders(<EnvironmentStages {...propsWithEmptyStage} />)

    expect(screen.getByTestId('placeholder-stage')).toBeInTheDocument()
    expect(screen.getByText('No service for this stage.')).toBeInTheDocument()
  })
})
