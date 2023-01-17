import { render } from '__tests__/utils/setup-jest'
import Container from './container'

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useLocation: jest.fn(() => 'pathname'),
}))

describe('Container', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Container>Content</Container>)
    expect(baseElement).toBeTruthy()
  })
})
