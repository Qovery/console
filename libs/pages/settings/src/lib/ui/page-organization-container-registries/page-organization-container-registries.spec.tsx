import { render } from '@testing-library/react'
import PageOrganizationContainerRegistries from './page-organization-container-registries'

describe('PageOrganizationContainerRegistries', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationContainerRegistries />)
    expect(baseElement).toBeTruthy()
  })
})
