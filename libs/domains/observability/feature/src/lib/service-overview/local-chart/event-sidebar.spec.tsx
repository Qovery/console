import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EventSidebar } from './event-sidebar'
import type { ReferenceLineEvent } from './local-chart'

jest.mock('../util-filter/service-overview-context', () => ({
  useServiceOverviewContext: () => ({
    useLocalTime: false,
    hoveredEventKey: null,
    setHoveredEventKey: jest.fn(),
  }),
}))

jest.mock('../util-chart/format-timestamp', () => ({
  formatTimestamp: (timestamp: number) => ({
    fullTimeString: new Date(timestamp).toLocaleString(),
    timeString: new Date(timestamp).toLocaleTimeString(),
  }),
}))

describe('EventSidebar', () => {
  const mockEvents: ReferenceLineEvent[] = [
    {
      type: 'event',
      timestamp: 1640994000000,
      reason: 'Deployed',
      icon: 'check',
      key: 'deploy-123',
      color: 'var(--color-green-500)',
      version: 'v1.0.0',
      repository: 'my-app',
    },
    {
      type: 'event',
      timestamp: 1640994300000,
      reason: 'Deploy failed',
      icon: 'xmark',
      key: 'deploy-456',
      color: 'var(--color-red-500)',
      version: 'v1.1.0',
      repository: 'my-app',
    },
    {
      type: 'exit-code',
      timestamp: 1640994600000,
      reason: 'Container exited',
      icon: 'warning',
      key: 'container-abc123',
      color: 'var(--color-yellow-500)',
      description: 'Exit code 1',
      pod: 'bc123',
    },
  ]

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<EventSidebar events={[]} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with no events', () => {
    renderWithProviders(<EventSidebar events={[]} />)
    expect(screen.getByText('No events associated')).toBeInTheDocument()
  })

  it('should render events list when events are provided', () => {
    renderWithProviders(<EventSidebar events={mockEvents} />)

    expect(screen.getByText('Events associated')).toBeInTheDocument()
    expect(screen.getByText('Deployed')).toBeInTheDocument()
    expect(screen.getByText('Deploy failed')).toBeInTheDocument()
    expect(screen.getByText('Container exited')).toBeInTheDocument()
  })

  it('should display singular Event when only one event', () => {
    renderWithProviders(<EventSidebar events={[mockEvents[0]]} />)
    expect(screen.getByText('Event associated')).toBeInTheDocument()
  })

  it('should display plural Events when multiple events', () => {
    renderWithProviders(<EventSidebar events={mockEvents} />)
    expect(screen.getByText('Events associated')).toBeInTheDocument()
  })
})
