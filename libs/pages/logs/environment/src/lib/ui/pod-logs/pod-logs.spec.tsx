import { render } from '__tests__/utils/setup-jest'
import PodLogs from './pod-logs/pod-logs'

describe('PodLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PodLogs />)
    expect(baseElement).toBeTruthy()
  })
})
