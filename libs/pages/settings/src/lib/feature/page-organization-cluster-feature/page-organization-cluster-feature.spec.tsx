import { render } from '@testing-library/react'
import PageOrganizationClusterFeature from './page-organization-cluster-feature'

describe('PageOrganizationClusterFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationClusterFeature />)
    expect(baseElement).toBeTruthy()
  })
})
