import { render } from '__tests__/utils/setup-jest'
import PageOrganizationClusterFeature from './page-organization-cluster-feature'

describe('PageOrganizationClusterFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationClusterFeature />)
    expect(baseElement).toBeTruthy()
  })
})
