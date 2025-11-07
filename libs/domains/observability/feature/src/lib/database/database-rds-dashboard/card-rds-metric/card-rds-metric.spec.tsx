import { render, screen } from '@qovery/shared/util-tests'
import { CardRdsMetric } from './card-rds-metric'

jest.mock('@qovery/shared/ui', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Heading: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  Icon: ({ iconName }: { iconName: string }) => <i data-testid={`icon-${iconName}`}>icon</i>,
  Section: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  Skeleton: ({ children, show }: { children: React.ReactNode; show?: boolean }) =>
    show ? <div>Loading...</div> : <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@qovery/shared/util-js', () => ({
  twMerge: (...args: string[]) => args.join(' '),
}))

describe('CardRdsMetric', () => {
  it('should render successfully', () => {
    const { container } = render(<CardRdsMetric title="Test Metric" />)
    expect(container).toBeTruthy()
  })

  it('should render title', () => {
    render(<CardRdsMetric title="Unvacuumed Transactions" />)
    expect(screen.getByText('Unvacuumed Transactions')).toBeInTheDocument()
  })

  it('should render value with unit', () => {
    render(<CardRdsMetric title="CPU Usage" value={85} unit="%" />)
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<CardRdsMetric title="Test" description="Test description" />)
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render GREEN status badge', () => {
    render(<CardRdsMetric title="Test" status="GREEN" />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByTestId('icon-circle-check')).toBeInTheDocument()
  })

  it('should render YELLOW status badge', () => {
    render(<CardRdsMetric title="Test" status="YELLOW" />)
    expect(screen.getByText('Warning')).toBeInTheDocument()
    expect(screen.getByTestId('icon-triangle-exclamation')).toBeInTheDocument()
  })

  it('should render RED status badge', () => {
    render(<CardRdsMetric title="Test" status="RED" />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByTestId('icon-circle-exclamation')).toBeInTheDocument()
  })

  it('should show loading skeleton when isLoading is true', () => {
    render(<CardRdsMetric title="Test" value={100} isLoading={true} />)
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0)
  })
})
