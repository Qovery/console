import { render, screen } from '@qovery/shared/util-tests'
import { PlaceholderMonitoring } from './placeholder-monitoring'

jest.mock('@qovery/shared/ui', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  Heading: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  Icon: () => <i>icon</i>,
  Section: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('PlaceholderMonitoring', () => {
  it('should render successfully', () => {
    const { container } = render(<PlaceholderMonitoring />)
    expect(container).toBeTruthy()
  })

  it('should render database status chart', () => {
    render(<PlaceholderMonitoring />)
    expect(screen.getByText('Database status')).toBeInTheDocument()
  })

  it('should render placeholder cards', () => {
    render(<PlaceholderMonitoring />)
    expect(screen.getByText('Database connections')).toBeInTheDocument()
    expect(screen.getByText('CPU utilization')).toBeInTheDocument()
    expect(screen.getByText('Storage usage')).toBeInTheDocument()
    expect(screen.getByText('IOPS performance')).toBeInTheDocument()
  })

  it('should render card descriptions', () => {
    render(<PlaceholderMonitoring />)
    expect(screen.getByText('active connections')).toBeInTheDocument()
    expect(screen.getByText('database CPU usage')).toBeInTheDocument()
    expect(screen.getByText('% of allocated storage')).toBeInTheDocument()
    expect(screen.getByText('read/write operations')).toBeInTheDocument()
  })

  it('should render healthy status badge', () => {
    render(<PlaceholderMonitoring />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })
})
