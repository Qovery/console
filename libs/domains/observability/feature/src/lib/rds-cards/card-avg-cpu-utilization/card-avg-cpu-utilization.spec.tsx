import { render, screen } from '@qovery/shared/util-tests'
import { CardAvgCpuUtilization } from './card-avg-cpu-utilization'

jest.mock('../card-rds-metric/card-rds-metric', () => ({
  CardRdsMetric: ({ title, description, unit }: { title: string; description: string; unit?: string }) => (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
      {unit && <span>{unit}</span>}
    </div>
  ),
}))

describe('CardAvgCpuUtilization', () => {
  it('should render successfully', () => {
    const { container } = render(<CardAvgCpuUtilization clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(container).toBeTruthy()
  })

  it('should render title', () => {
    render(<CardAvgCpuUtilization clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(screen.getByText('avg CPU Utilization')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<CardAvgCpuUtilization clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(screen.getByText('average CPU usage')).toBeInTheDocument()
  })

  it('should render unit', () => {
    render(<CardAvgCpuUtilization clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(screen.getByText('%')).toBeInTheDocument()
  })
})
