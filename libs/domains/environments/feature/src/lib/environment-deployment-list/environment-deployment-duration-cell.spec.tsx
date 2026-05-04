import { act } from 'react'
import { render, screen } from '@qovery/shared/util-tests'
import { EnvironmentDeploymentDurationCell } from './environment-deployment-duration-cell'

describe('EnvironmentDeploymentDurationCell', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-01-23T09:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows formatted total duration when present', () => {
    render(
      <EnvironmentDeploymentDurationCell createdAt="2025-01-23T08:55:00.000Z" status="DEPLOYED" totalDuration="PT5M" />
    )

    expect(screen.getByText('00:05:00')).toBeInTheDocument()
  })

  it('shows live elapsed time for DEPLOYING without total duration', () => {
    render(<EnvironmentDeploymentDurationCell createdAt="2025-01-23T08:55:00.000Z" status="DEPLOYING" />)

    expect(screen.getByText('00:05:00')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText('00:05:01')).toBeInTheDocument()
  })

  it('prefers live elapsed over API total_duration while DEPLOYING', () => {
    render(
      <EnvironmentDeploymentDurationCell
        createdAt="2025-01-23T08:55:00.000Z"
        status="DEPLOYING"
        totalDuration="PT1M"
      />
    )

    expect(screen.getByText('00:05:00')).toBeInTheDocument()
    expect(screen.queryByText('00:01:00')).not.toBeInTheDocument()
  })

  it('shows placeholder for DEPLOYMENT_QUEUED', () => {
    render(<EnvironmentDeploymentDurationCell createdAt="2025-01-23T08:55:00.000Z" status="DEPLOYMENT_QUEUED" />)

    expect(screen.getByText('--')).toBeInTheDocument()
  })
})
