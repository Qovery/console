import { render } from '@testing-library/react'
import PageSettingsDeploymentFeature from './page-settings-deployment-feature'

describe('PageSettingsDeploymentFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDeploymentFeature />)
    expect(baseElement).toBeTruthy()
  })
})
