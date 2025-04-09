import { renderWithProviders } from '@qovery/shared/util-tests'
import { Spotlight } from './spotlight'

describe('Spotlight', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Spotlight organizationId="000" open={true} />)
    expect(baseElement).toBeTruthy()

    expect(baseElement).toHaveTextContent('Search')
    expect(baseElement).toHaveTextContent('Settings')
    expect(baseElement).toHaveTextContent('View my container registries')
    expect(baseElement).toHaveTextContent('View my helm repositories')
    expect(baseElement).toHaveTextContent('View my git tokens')
    expect(baseElement).toHaveTextContent('View my webhooks')
    expect(baseElement).toHaveTextContent('View my API tokens')
    expect(baseElement).toHaveTextContent('View my team members')
    expect(baseElement).toHaveTextContent('Go to personal settings')
    expect(baseElement).toHaveTextContent('Help')
    expect(baseElement).toHaveTextContent('Go to documentation')
    expect(baseElement).toHaveTextContent('Community Forum')
    expect(baseElement).toHaveTextContent('Roadmap')
    expect(baseElement).toHaveTextContent('Get help')
    expect(baseElement).toHaveTextContent('Arrow to navigate')
    expect(baseElement).toHaveTextContent('Enter to open')
  })
})
