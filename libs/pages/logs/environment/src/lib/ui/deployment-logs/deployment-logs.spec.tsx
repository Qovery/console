import { render } from '__tests__/utils/setup-jest'
import DeploymentLogs from './deployment-logs'

describe('DeploymentLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentLogs />)
    expect(baseElement).toBeTruthy()
  })
})
