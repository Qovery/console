import type { ReactNode } from 'react'
import { render, screen } from '@qovery/shared/util-tests'
import { CardMetric } from './card-metric'

jest.mock('@qovery/shared/ui', () => ({
  Badge: ({ children }: { children: ReactNode }) => <span data-testid="badge">{children}</span>,
  Button: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Heading: ({ children }: { children: ReactNode }) => <h3>{children}</h3>,
  Icon: ({ iconName }: { iconName: string }) => <i data-testid={`icon-${iconName}`}>icon</i>,
  Section: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  Skeleton: ({ children, show }: { children: ReactNode; show?: boolean }) =>
    show ? <div>Loading...</div> : <div>{children}</div>,
  Tooltip: ({ children, content }: { children: ReactNode; content?: ReactNode }) => (
    <div data-testid="tooltip" data-content={typeof content === 'string' ? content : ''}>
      {children}
    </div>
  ),
}))

jest.mock('@qovery/shared/util-js', () => ({
  twMerge: (...args: string[]) => args.join(' '),
}))

describe('CardMetric', () => {
  it('should render successfully', () => {
    const { container } = render(<CardMetric title="Test Metric" />)
    expect(container).toBeTruthy()
  })

  it('should render title', () => {
    render(<CardMetric title="Unvacuumed Transactions" />)
    expect(screen.getByText('Unvacuumed Transactions')).toBeInTheDocument()
  })

  it('should render value with unit', () => {
    render(<CardMetric title="CPU Usage" value={85} unit="%" />)
    expect(screen.getByText(/85/)).toHaveTextContent('85 %')
  })

  it('should render description', () => {
    render(<CardMetric title="Test" description="Test description" />)
    expect(screen.getAllByTestId('tooltip')[0]).toHaveAttribute('data-content', 'Test description')
  })

  it('should render GREEN status badge', () => {
    render(<CardMetric title="Test" status="GREEN" />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByTestId('icon-circle-check')).toBeInTheDocument()
  })

  it('should render YELLOW status badge', () => {
    render(<CardMetric title="Test" status="YELLOW" />)
    expect(screen.getByText('Warning')).toBeInTheDocument()
    expect(screen.getByTestId('icon-triangle-exclamation')).toBeInTheDocument()
  })

  it('should render RED status badge', () => {
    render(<CardMetric title="Test" status="RED" />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByTestId('icon-circle-exclamation')).toBeInTheDocument()
  })

  it('should show loading skeleton when isLoading is true', () => {
    render(<CardMetric title="Test" value={100} isLoading={true} />)
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0)
  })
})
