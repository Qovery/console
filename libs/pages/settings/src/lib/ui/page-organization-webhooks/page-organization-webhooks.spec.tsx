import { render } from '@testing-library/react'
import PageOrganizationWebhooks from './page-organization-webhooks'

describe('PageOrganizationWebhooks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationWebhooks />)
    expect(baseElement).toBeTruthy()
  })
})
