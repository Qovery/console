import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ChartLegend } from './chart-legend'

const mockItems = [
  { key: 'cpu', label: 'CPU Usage', color: '#ff6b35' },
  { key: 'memory', label: 'Memory Usage', color: '#4ecdc4' },
  { key: 'disk', label: 'Disk Usage', color: '#45b7d1' },
]

describe('ChartLegend', () => {
  it('should render legend items', () => {
    renderWithProviders(<ChartLegend items={mockItems} />)

    expect(screen.getByText('CPU Usage')).toBeInTheDocument()
    expect(screen.getByText('Memory Usage')).toBeInTheDocument()
    expect(screen.getByText('Disk Usage')).toBeInTheDocument()
  })

  it('should render nothing when items array is empty', () => {
    const { container } = renderWithProviders(<ChartLegend items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should call onToggle when legend item is clicked', async () => {
    const mockOnToggle = jest.fn()
    const { userEvent: user } = renderWithProviders(<ChartLegend items={mockItems} onToggle={mockOnToggle} />)

    const cpuItem = screen.getByText('CPU Usage')
    const button = cpuItem.closest('[role="button"]') as HTMLElement

    await user.click(button)

    expect(mockOnToggle).toHaveBeenCalledWith('cpu')
  })

  it('should call onToggle when Enter key is pressed on legend item', async () => {
    const mockOnToggle = jest.fn()
    const { userEvent: user } = renderWithProviders(<ChartLegend items={mockItems} onToggle={mockOnToggle} />)

    const cpuItem = screen.getByText('CPU Usage').closest('[role="button"]') as HTMLElement
    cpuItem.focus()
    await user.keyboard('{Enter}')

    expect(mockOnToggle).toHaveBeenCalledWith('cpu')
  })

  it('should call onToggle when Space key is pressed on legend item', async () => {
    const mockOnToggle = jest.fn()
    const { userEvent: user } = renderWithProviders(<ChartLegend items={mockItems} onToggle={mockOnToggle} />)

    const cpuItem = screen.getByText('CPU Usage').closest('[role="button"]') as HTMLElement
    cpuItem.focus()
    await user.keyboard('{ }')

    expect(mockOnToggle).toHaveBeenCalledWith('cpu')
  })

  it('should call onHighlight when mouse enters legend item', async () => {
    const mockOnHighlight = jest.fn()
    const { userEvent: user } = renderWithProviders(<ChartLegend items={mockItems} onHighlight={mockOnHighlight} />)

    const cpuItem = screen.getByText('CPU Usage').closest('[role="button"]') as HTMLElement
    await user.hover(cpuItem)

    expect(mockOnHighlight).toHaveBeenCalledWith('cpu')
  })

  it('should apply selected styles when keys are in selectedKeys set', () => {
    const selectedKeys = new Set(['cpu', 'memory'])
    renderWithProviders(<ChartLegend items={mockItems} selectedKeys={selectedKeys} />)

    const cpuItem = screen.getByText('CPU Usage').closest('[role="button"]') as HTMLElement
    const diskItem = screen.getByText('Disk Usage').closest('[role="button"]') as HTMLElement

    expect(cpuItem).toHaveStyle({ borderColor: '#ff6b35', borderWidth: '1px' })
    expect(diskItem).not.toHaveStyle({ borderWidth: '1px' })
  })

  it('should apply custom className when provided', () => {
    renderWithProviders(<ChartLegend items={mockItems} className="custom-class" />)

    expect(screen.getByText('CPU Usage').closest('.custom-class')).toBeInTheDocument()
  })

  it('should respect rightGutterWidth prop', () => {
    renderWithProviders(<ChartLegend items={mockItems} rightGutterWidth={100} />)

    const legendContainer = screen.getByText('CPU Usage').closest('div[style*="width"]')
    expect(legendContainer).toHaveStyle({ width: 'calc(100% - 100px)' })
  })

  it('should render color indicators for each item', () => {
    renderWithProviders(<ChartLegend items={mockItems} />)

    const colorIndicators = screen
      .getAllByRole('button')
      .map((item) => item.querySelector('span[style*="background-color"]'))

    expect(colorIndicators).toHaveLength(3)
    expect(colorIndicators[0]).toHaveStyle({ backgroundColor: '#ff6b35' })
    expect(colorIndicators[1]).toHaveStyle({ backgroundColor: '#4ecdc4' })
    expect(colorIndicators[2]).toHaveStyle({ backgroundColor: '#45b7d1' })
  })
})
