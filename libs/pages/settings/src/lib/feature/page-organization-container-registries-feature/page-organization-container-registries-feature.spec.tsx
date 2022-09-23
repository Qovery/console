import { render } from '@testing-library/react'
import PageOrganizationContainerRegistriesFeature from './page-organization-container-registries-feature'

describe('PageOrganizationContainerRegistriesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationContainerRegistriesFeature />)
    expect(baseElement).toBeTruthy()
  })
})
