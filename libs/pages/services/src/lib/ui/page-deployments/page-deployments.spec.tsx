import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageDeployments from './page-deployments'

const props = {
  listHelpfulLinks: [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
      linkLabel: 'How to configure my application',
    },
  ],
}

describe('DeploymentsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageDeployments {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have empty state', () => {
    renderWithProviders(<PageDeployments deployments={[]} isLoading={false} {...props} />)
    screen.getByText('No deployment yet')
  })
})
