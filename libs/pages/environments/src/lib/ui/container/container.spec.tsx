import { renderWithProviders } from '@qovery/shared/util-tests'
import Container from './container'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/general',
  }),
}))

describe('Container', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Container>Content</Container>)
    expect(baseElement).toBeTruthy()
  })
})
