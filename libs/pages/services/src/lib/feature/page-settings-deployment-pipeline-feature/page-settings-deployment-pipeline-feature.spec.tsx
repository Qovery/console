import { render } from '@testing-library/react'
import PageSettingsDeploymentPipelineFeature from './page-settings-deployment-pipeline-feature'

describe('PageSettingsDeploymentPipelineFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDeploymentPipelineFeature />)
    expect(baseElement).toBeTruthy()
  })
})
