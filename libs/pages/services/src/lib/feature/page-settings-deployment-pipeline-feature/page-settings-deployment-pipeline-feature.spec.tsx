import { render } from '__tests__/utils/setup-jest'
import PageSettingsDeploymentPipelineFeature from './page-settings-deployment-pipeline-feature'

describe('PageSettingsDeploymentPipelineFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDeploymentPipelineFeature />)
    expect(baseElement).toBeTruthy()
  })
})
