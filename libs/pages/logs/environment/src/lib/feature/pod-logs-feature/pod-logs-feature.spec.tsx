import { render } from '__tests__/utils/setup-jest'
import PodLogsFeature from './pod-logs-feature'

describe('PodLogsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PodLogsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
