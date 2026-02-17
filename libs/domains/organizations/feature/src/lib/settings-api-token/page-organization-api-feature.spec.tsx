import { render } from '__tests__/utils/setup-jest'
import PageOrganizationApiFeature from '../../../../../../pages/settings/src/lib/feature/page-organization-api-feature/page-organization-api-feature'

describe('PageOrganizationApiFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationApiFeature />)
    expect(baseElement).toBeTruthy()
  })
})
