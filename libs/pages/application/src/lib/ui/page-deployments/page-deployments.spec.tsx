import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageDeployments } from './page-deployments'

describe('DeploymentsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageDeployments />)
    expect(baseElement).toBeTruthy()
  })

  it('should have empty state', () => {
    renderWithProviders(<PageDeployments deployments={[]} isLoading={false} />)
    screen.getByText('No deployment yet')
  })
})
