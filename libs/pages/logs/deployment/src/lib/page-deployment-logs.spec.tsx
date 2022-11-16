import { render } from '__tests__/utils/setup-jest'
import PageDeploymentLogs from './page-deployment-logs'

describe('PageDeploymentLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDeploymentLogs />)
    expect(baseElement).toBeTruthy()
  })
})
