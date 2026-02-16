import { render } from '__tests__/utils/setup-jest'
import AcceptInvitation from './accept-invitation'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useLocation: () => ({ pathname: '/accept-invitation', search: '' }),
  useNavigate: () => jest.fn(),
}))

describe('AcceptInvitation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AcceptInvitation onSubmit={jest.fn()} />)
    expect(baseElement).toBeTruthy()
  })
})
