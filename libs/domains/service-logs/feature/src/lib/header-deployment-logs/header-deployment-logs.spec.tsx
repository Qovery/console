import { type Status } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HeaderDeploymentLogs, formatDeploymentDurationClock } from './header-deployment-logs'

const mockBack = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ executionId: '0518c3e2-4f1a-4b7e-9d2c-8a6f5e3b1824' }),
  useRouter: () => ({ history: { back: mockBack } }),
}))

const serviceStatus: Status = {
  id: 'service-1',
  state: 'DEPLOYED',
  service_deployment_status: 'UP_TO_DATE',
  is_part_last_deployment: true,
  deployment_request_id: null,
  deployment_requests_count: 0,
  status_details: { action: 'DEPLOY', status: 'SUCCESS', sub_action: 'NONE' },
  steps: { total_duration_sec: 240, total_computing_duration_sec: 238, details: [] },
}

describe('HeaderDeploymentLogs', () => {
  it('shows the action, its date, its duration and the execution id', () => {
    renderWithProviders(
      <HeaderDeploymentLogs serviceStatus={serviceStatus} deploymentDate="2026-11-15T08:38:00Z">
        <button type="button">Latest</button>
      </HeaderDeploymentLogs>
    )

    expect(screen.getByText('Deploy')).toBeInTheDocument()
    expect(screen.getByText('15/11')).toBeInTheDocument()
    expect(screen.getByText('03:58')).toBeInTheDocument()
    expect(screen.getByText('0518c…824')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Latest' })).toBeInTheDocument()
  })

  it('goes back to the previous page', async () => {
    const { userEvent } = renderWithProviders(<HeaderDeploymentLogs serviceStatus={serviceStatus} />)

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(mockBack).toHaveBeenCalled()
  })
})

describe('formatDeploymentDurationClock', () => {
  it.each([
    [0, '00:00'],
    [238, '03:58'],
    [3725, '1:02:05'],
  ])('formats %i seconds as %s', (durationSec, expected) => {
    expect(formatDeploymentDurationClock(durationSec)).toBe(expected)
  })
})
