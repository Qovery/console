import { render } from '__tests__/utils/setup-jest'
import PageLogin from './page-login'

jest.mock('@elgorditosalsero/react-gtm-hook', () => ({
  ...jest.requireActual('@elgorditosalsero/react-gtm-hook'),
  useGTMDispatch: jest.fn(),
}))

describe('PageLogin', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageLogin />)
    expect(baseElement).toBeTruthy()
  })
})
