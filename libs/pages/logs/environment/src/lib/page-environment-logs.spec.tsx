import { render } from '__tests__/utils/setup-jest'
import PageEnvironmentLogs from './page-environment-logs'

describe('PageEnvironmentLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageEnvironmentLogs />)
    expect(baseElement).toBeTruthy()
  })
})
