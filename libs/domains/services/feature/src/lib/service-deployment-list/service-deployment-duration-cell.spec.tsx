import { act } from 'react'
import { render, screen } from '@qovery/shared/util-tests'
import { ServiceDeploymentDurationCell } from './service-deployment-duration-cell'

describe('ServiceDeploymentDurationCell', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-01-23T09:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows formatted total duration when present', () => {
    render(<ServiceDeploymentDurationCell createdAt="2025-01-23T08:55:00.000Z" status="DONE" totalDuration="PT5M" />)

    expect(screen.getByText('00:05:00')).toBeInTheDocument()
  })

  it('shows live elapsed time for ONGOING deployment without total duration', () => {
    render(<ServiceDeploymentDurationCell createdAt="2025-01-23T08:55:00.000Z" status="ONGOING" />)

    expect(screen.getByText('00:05:00')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText('00:05:01')).toBeInTheDocument()
  })

  it('prefers live elapsed over API total_duration while ONGOING', () => {
    render(<ServiceDeploymentDurationCell createdAt="2025-01-23T08:55:00.000Z" status="ONGOING" totalDuration="PT1M" />)

    expect(screen.getByText('00:05:00')).toBeInTheDocument()
    expect(screen.queryByText('00:01:00')).not.toBeInTheDocument()
  })

  it('shows placeholder for QUEUED', () => {
    render(<ServiceDeploymentDurationCell createdAt="2025-01-23T08:55:00.000Z" status="QUEUED" />)

    expect(screen.getByText('--')).toBeInTheDocument()
  })
})
