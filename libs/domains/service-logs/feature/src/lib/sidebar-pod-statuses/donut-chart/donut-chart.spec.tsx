import { renderWithProviders } from '@qovery/shared/util-tests'
import DonutChart from './donut-chart'

const defaultProps = {
  width: 200,
  height: 200,
  innerRadius: 60,
  outerRadius: 80,
  items: [
    { value: 30, color: '#ff0000' },
    { value: 70, color: '#00ff00' },
  ],
}

describe('DonutChart', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<DonutChart {...defaultProps} />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders with correct dimensions', () => {
    const { container } = renderWithProviders(<DonutChart {...defaultProps} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '200')
  })

  it('renders default color when items array is empty', () => {
    const { container } = renderWithProviders(<DonutChart {...defaultProps} items={[]} />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(1)
  })

  it('renders full circle for single item', () => {
    const singleItem = [{ value: 100, color: '#ff0000' }]
    const { container } = renderWithProviders(<DonutChart {...defaultProps} items={singleItem} />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(1)

    const path = paths[0]
    expect(path).toHaveAttribute('fill', '#ff0000')
    expect(path).toHaveAttribute('stroke', '#ff0000')
  })

  it('renders correct number of segments for multiple items', () => {
    const { container } = renderWithProviders(<DonutChart {...defaultProps} />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(2)
  })

  it('renders nothing when all values are zero', () => {
    const zeroItems = [
      { value: 0, color: '#ff0000' },
      { value: 0, color: '#00ff00' },
    ]
    const { container } = renderWithProviders(<DonutChart {...defaultProps} items={zeroItems} />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(0)
  })

  it('applies correct transformation for centering', () => {
    const { container } = renderWithProviders(<DonutChart {...defaultProps} />)
    const g = container.querySelector('g')
    expect(g).toHaveAttribute('transform', 'translate(100,100)')
  })

  it('generates valid paths for segments', () => {
    const { container } = renderWithProviders(<DonutChart {...defaultProps} />)
    const paths = container.querySelectorAll('path')
    paths.forEach((path) => {
      const d = path.getAttribute('d')
      expect(d).toBeTruthy()
      expect(d?.includes('M')).toBeTruthy() // Should contain move command
      expect(d?.includes('A')).toBeTruthy() // Should contain arc command
    })
  })

  it('assigns correct colors to segments', () => {
    const { container } = renderWithProviders(<DonutChart {...defaultProps} />)
    const paths = container.querySelectorAll('path')
    expect(paths[0]).toHaveAttribute('fill', '#ff0000')
    expect(paths[1]).toHaveAttribute('fill', '#00ff00')
  })
})
