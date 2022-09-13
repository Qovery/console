import { render } from '@testing-library/react'
import PageOrganizationFeature from './page-organization-feature'

describe('PageOrganizationFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationFeature />)
    expect(baseElement).toBeTruthy()
  })
})
