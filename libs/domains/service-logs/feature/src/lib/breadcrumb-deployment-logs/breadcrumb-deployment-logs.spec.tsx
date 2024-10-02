import { renderWithProviders } from '@qovery/shared/util-tests'
import { BreadcrumbDeploymentLogs } from './breadcrumb-deployment-logs'

describe('BreadcrumbDeploymentLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<BreadcrumbDeploymentLogs />)
    expect(baseElement).toBeTruthy()
  })
})
