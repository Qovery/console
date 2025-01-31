import { renderWithProviders } from '@qovery/shared/util-tests'
import { PageDeploymentsFeature } from './page-deployments-feature'

describe('PageDeploymentsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageDeploymentsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
