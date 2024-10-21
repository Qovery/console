import { type DeploymentStageWithServicesStatuses } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  EnvironmentStagesFeature,
  type EnvironmentStagesFeatureProps,
  matchServicesWithStatuses,
} from './environment-stages-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ versionId: 'version-1' }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useServices: () => ({
    data: [
      { id: 'app-1', name: 'App 1', serviceType: 'APPLICATION' },
      { id: 'app-2', name: 'App 2', serviceType: 'APPLICATION' },
    ],
  }),
}))

describe('EnvironmentStagesFeature', () => {
  const defaultProps: EnvironmentStagesFeatureProps = {
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
      state: 'RUNNING',
      total_duration_sec: 120,
    },
    deploymentStages: [
      {
        stage: {
          id: 'stage-1',
          name: 'Stage 1',
          status: 'ONGOING',
          steps: { total_duration_sec: 120 },
        },
        applications: [
          {
            id: 'app-1',
            name: 'App 1',
            state: 'BUILDING',
            is_part_last_deployment: true,
            steps: { total_duration_sec: 60 },
          },
          {
            id: 'app-2',
            name: 'App 2',
            state: 'STOPPED',
            is_part_last_deployment: false,
            steps: { total_duration_sec: 30 },
          },
        ],
      },
    ],
    preCheckStage: {
      status: 'SUCCESS',
      total_duration_sec: 30,
    },
  }

  it('renders loading spinner when environmentStatus is undefined', () => {
    renderWithProviders(<EnvironmentStagesFeature {...defaultProps} environmentStatus={undefined} />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('renders stages and services', () => {
    renderWithProviders(<EnvironmentStagesFeature {...defaultProps} />)
    expect(screen.getByText('Stage 1')).toBeInTheDocument()
    expect(screen.getByText('App 1')).toBeInTheDocument()
  })

  it('renders service duration', () => {
    renderWithProviders(<EnvironmentStagesFeature {...defaultProps} />)
    expect(screen.getByText('1m 0s')).toBeInTheDocument()
  })

  it('does not render skipped services when hideSkipped is true', async () => {
    const { userEvent } = renderWithProviders(<EnvironmentStagesFeature {...defaultProps} />)

    await userEvent.click(screen.getByLabelText('Hide skipped'))

    expect(screen.getByText('App 1')).toBeInTheDocument()
    expect(screen.queryByText('App 2')).not.toBeInTheDocument()
  })

  it('should correctly map services and stages', () => {
    const input = [
      {
        stage: { id: 'stage1', name: 'Stage 1' },
        applications: [{ id: 'app1', name: 'App 1', state: 'RUNNING' }],
        databases: [{ id: 'db1', name: 'DB 1', state: 'STOPPED' }],
        containers: [],
        jobs: [],
        helms: [],
      },
    ]

    const expectedOutput = [
      {
        stage: { id: 'stage1', name: 'Stage 1' },
        services: [
          { id: 'app1', name: 'App 1', state: 'RUNNING', status: 'RUNNING' },
          { id: 'db1', name: 'DB 1', state: 'STOPPED', status: 'STOPPED' },
        ],
      },
    ]

    const result = matchServicesWithStatuses(input as DeploymentStageWithServicesStatuses[])
    expect(result).toEqual(expectedOutput)
  })
})
