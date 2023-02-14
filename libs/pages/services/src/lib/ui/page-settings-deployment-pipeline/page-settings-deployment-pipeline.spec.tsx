import { render } from '@testing-library/react'
import PageSettingsDeploymentPipeline from './page-settings-deployment-pipeline'

describe('PageSettingsDeploymentPipeline', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDeploymentPipeline />)
    expect(baseElement).toBeTruthy()
  })
})
