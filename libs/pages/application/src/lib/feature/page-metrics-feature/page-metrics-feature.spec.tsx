import PageMetricsFeature from './page-metrics-feature'
import { render } from '__tests__/utils/setup-jest'

describe('Metrics', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageMetricsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
