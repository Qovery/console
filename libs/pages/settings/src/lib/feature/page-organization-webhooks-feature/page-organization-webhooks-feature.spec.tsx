import { render } from '@testing-library/react'
import PageOrganizationWebhooksFeature from './page-organization-webhooks-feature'

describe('PageOrganizationWebhooksFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationWebhooksFeature />)
    expect(baseElement).toBeTruthy()
  })
})
