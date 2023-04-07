import { render } from '__tests__/utils/setup-jest'
import DeploymentLogsFeature from './deployment-logs-feature'

describe('DeploymentLogsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentLogsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
