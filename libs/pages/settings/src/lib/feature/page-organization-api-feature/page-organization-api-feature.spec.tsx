import { render } from '__tests__/utils/setup-jest'
import PageOrganizationApiFeature from './page-organization-api-feature'

describe('PageOrganizationContainerRegistriesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationApiFeature />)
    expect(baseElement).toBeTruthy()
  })
})
