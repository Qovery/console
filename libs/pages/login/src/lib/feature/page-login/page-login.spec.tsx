import { render } from '__tests__/utils/setup-jest'
import PageLoginFeature from './page-login'

jest.mock('@elgorditosalsero/react-gtm-hook', () => ({
  ...jest.requireActual('@elgorditosalsero/react-gtm-hook'),
  useGTMDispatch: jest.fn(),
}))

describe('PageLoginFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageLoginFeature />)
    expect(baseElement).toBeTruthy()
  })
})
