import { renderWithProviders } from '@qovery/shared/util-tests'
import { BreadcrumbDeploymentHistory } from './breadcrumb-deployment-history'

describe('BreadcrumbDeploymentHistory', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<BreadcrumbDeploymentHistory />)
    expect(baseElement).toBeTruthy()
  })
})
