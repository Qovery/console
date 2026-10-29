import { type Status } from 'qovery-typescript-axios'
import { useDefaultAdvancedSettings, useService } from '@qovery/domains/services/feature'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type EnvironmentLogIds, useDeploymentLogs } from '../hooks/use-deployment-logs/use-deployment-logs'
import { DeploymentLogsSteps } from './deployment-logs-steps'

jest.mock('../hooks/use-deployment-logs/use-deployment-logs')
jest.mock('@qovery/domains/services/feature')

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '1', projectId: '2', serviceId: 'service-1', executionId: '4' }),
}))

const useDeploymentLogsMock = useDeploymentLogs as jest.MockedFunction<typeof useDeploymentLogs>
const useServiceMock = useService as jest.MockedFunction<typeof useService>
const useDefaultAdvancedSettingsMock = useDefaultAdvancedSettings as jest.MockedFunction<
  typeof useDefaultAdvancedSettings
>

function createLog(id: number, message: string, stageStep: string, stepName?: string): EnvironmentLogIds {
  return {
    id,
    type: 'info',
    timestamp: `2026-10-26T08:38:${id.toString().padStart(2, '0')}Z`,
    details: { stage: { step: stageStep }, step_name: stepName },
    message: { safe_message: message },
  }
}

const serviceStatus: Status = {
  id: 'service-1',
  state: 'DEPLOYED',
  service_deployment_status: 'UP_TO_DATE',
  is_part_last_deployment: true,
  deployment_request_id: null,
  deployment_requests_count: 0,
  status_details: { action: 'DEPLOY', status: 'SUCCESS', sub_action: 'NONE' },
  steps: {
    total_duration_sec: 90,
    total_computing_duration_sec: 90,
    details: [
      { step_name: 'GIT_CLONE', status: 'SUCCESS', duration_sec: 7 },
      {
        step_name: 'BUILD',
        status: 'SUCCESS',
        duration_sec: 70,
        sub_steps: [{ name: 'IMAGE_PUSH', status: 'SUCCESS', duration_sec: 13 }],
      },
      { step_name: 'DEPLOYMENT', status: 'SUCCESS', duration_sec: 11 },
    ],
  },
}

const logs = [
  createLog(1, 'Cloning repository acme/web-app', 'Build', 'GIT_CLONE'),
  createLog(2, 'Building layer 1', 'Build', 'BUILD'),
  createLog(3, 'Building layer 2', 'Build', 'BUILD'),
  createLog(4, 'Pushing manifest', 'Build', 'IMAGE_PUSH'),
  createLog(5, 'Pod is ready', 'Deploy', 'DEPLOYMENT'),
]

function mockLogs(data: EnvironmentLogIds[]) {
  useDeploymentLogsMock.mockReturnValue({
    data,
    isScrollPaused: false,
    setPauseLogs: jest.fn(),
    bufferedLogsCount: 0,
    showPreviousLogs: true,
    setShowPreviousLogs: jest.fn(),
  })
}

describe('DeploymentLogsSteps', () => {
  const environment = environmentFactoryMock(1)[0]

  beforeEach(() => {
    mockLogs(logs)
    useServiceMock.mockReturnValue({
      data: { id: 'service-1', name: 'web-app', serviceType: 'APPLICATION' },
    } as ReturnType<typeof useService>)
  })

  it('groups steps under their phase', () => {
    renderWithProviders(
      <DeploymentLogsSteps environment={environment} serviceStatus={serviceStatus} deploymentHistory={[]} />
    )

    expect(screen.getByRole('heading', { name: 'Logs' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Build' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Deploy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cloning repository 7s' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Building image Slowest 57s' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pushing image 13s' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Deploying application 11s' })).toBeInTheDocument()
    expect(screen.queryByText('Building layer 1')).not.toBeInTheDocument()
  })

  it('shows the CPU and memory the builder used against the build limits', async () => {
    useDefaultAdvancedSettingsMock.mockReturnValue({
      data: { 'build.cpu_max_in_milli': 8000, 'build.ram_max_in_gib': 16 },
    } as ReturnType<typeof useDefaultAdvancedSettings>)
    const [gitClone, build, deployment] = serviceStatus.steps?.details ?? []

    const { userEvent } = renderWithProviders(
      <DeploymentLogsSteps
        environment={environment}
        serviceStatus={{
          ...serviceStatus,
          steps: {
            total_duration_sec: 90,
            total_computing_duration_sec: 90,
            details: [
              gitClone,
              {
                ...build,
                builder_usage: { cpu_milli_avg: 1200, cpu_milli_max: 3800, memory_mib_max: 15155, samples: 20 },
              },
              deployment,
            ],
          },
        }}
        deploymentHistory={[]}
      />
    )

    expect(screen.getByText('CPU')).toBeInTheDocument()
    await userEvent.hover(screen.getByText('Memory'))

    expect(await screen.findAllByText('14.8 / 16 GiB (92%)')).not.toHaveLength(0)
  })

  it('shows the lines of a step once expanded', async () => {
    const { userEvent } = renderWithProviders(
      <DeploymentLogsSteps environment={environment} serviceStatus={serviceStatus} deploymentHistory={[]} />
    )

    const buildingImage = screen.getByRole('button', { name: /Building image/ })
    await userEvent.click(buildingImage)

    expect(buildingImage).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Building layer 1')).toBeInTheDocument()
    expect(screen.getByText('Building layer 2')).toBeInTheDocument()

    await userEvent.click(buildingImage)

    expect(screen.queryByText('Building layer 1')).not.toBeInTheDocument()
  })

  it('shows only the phases and steps matching the search, opened', async () => {
    const { userEvent } = renderWithProviders(
      <DeploymentLogsSteps environment={environment} serviceStatus={serviceStatus} deploymentHistory={[]} />
    )

    await userEvent.type(screen.getByRole('textbox', { name: 'Search logs' }), 'layer 2')

    expect(await screen.findByText('layer 2', { selector: 'mark' })).toBeInTheDocument()
    expect(screen.queryByText(/Building layer 1/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Building image 1 match/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.queryByRole('button', { name: /Cloning repository/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Deploy' })).not.toBeInTheDocument()
  })

  it('tells when no line matches the search', async () => {
    const { userEvent } = renderWithProviders(
      <DeploymentLogsSteps environment={environment} serviceStatus={serviceStatus} deploymentHistory={[]} />
    )

    await userEvent.type(screen.getByRole('textbox', { name: 'Search logs' }), 'nowhere')

    expect(await screen.findByText('No matching logs')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Build' })).not.toBeInTheDocument()
  })

  it('opens the running step and lists only the steps that started', () => {
    mockLogs(logs.slice(0, 3))

    renderWithProviders(
      <DeploymentLogsSteps
        environment={environment}
        serviceStatus={{
          ...serviceStatus,
          status_details: { action: 'DEPLOY', status: 'ONGOING', sub_action: 'NONE' },
          steps: {
            total_duration_sec: null,
            total_computing_duration_sec: 7,
            details: [
              { step_name: 'GIT_CLONE', status: 'SUCCESS', duration_sec: 7 },
              { step_name: 'BUILD', status: 'ONGOING', duration_sec: 20 },
            ],
          },
        }}
        deploymentHistory={[]}
      />
    )

    expect(screen.getByRole('button', { name: /Building image/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Streaming deployment logs…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Saving build cache/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Deploy' })).not.toBeInTheDocument()
  })

  it('shows the lines of an older deployment, by phase, when they carry no step', async () => {
    mockLogs([createLog(1, 'Cloning acme/web-app', 'Build'), createLog(2, 'Pod is ready', 'Deploy')])

    const { userEvent } = renderWithProviders(
      <DeploymentLogsSteps environment={environment} serviceStatus={serviceStatus} deploymentHistory={[]} />
    )

    expect(screen.queryByRole('button', { name: /Cloning repository/ })).not.toBeInTheDocument()
    const buildLogs = screen.getByRole('button', { name: 'Build logs 1min 17s' })
    await userEvent.click(buildLogs)

    expect(screen.getByText('Cloning acme/web-app')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Deploy logs 11s' })).toBeInTheDocument()
  })
})
