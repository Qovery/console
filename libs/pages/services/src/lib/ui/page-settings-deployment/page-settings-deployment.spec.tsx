import { render } from '@testing-library/react'
import PageSettingsDeployment from './page-settings-deployment'

describe('PageSettingsDeployment', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDeployment />)
    expect(baseElement).toBeTruthy()
  })
})
