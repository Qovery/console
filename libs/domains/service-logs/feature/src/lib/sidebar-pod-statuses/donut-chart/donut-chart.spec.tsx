import { render } from '@testing-library/react'
import DonutChart from './donut-chart'

describe('DonutChart', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DonutChart />)
    expect(baseElement).toBeTruthy()
  })
})
