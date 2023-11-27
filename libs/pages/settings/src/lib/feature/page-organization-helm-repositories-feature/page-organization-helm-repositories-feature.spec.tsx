import { renderWithProviders } from '@qovery/shared/util-tests'
import { PageOrganizationHelmRepositoriesFeature } from './page-organization-helm-repositories-feature'

describe('PageOrganizationHelmRepositoriesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationHelmRepositoriesFeature />)
    expect(baseElement).toBeTruthy()
  })
})
