import { render } from '__tests__/utils/setup-jest'
import PageOrganizationApiFeature from './page-organization-api-feature'

describe('PageOrganizationApiFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationApiFeature />)
    expect(baseElement).toBeTruthy()
  })
})
