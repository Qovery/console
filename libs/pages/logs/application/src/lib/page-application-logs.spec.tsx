import { render } from '__tests__/utils/setup-jest'
import PageApplicationLogs from './page-application-logs'

jest.mock('react-use-websocket', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('PageApplicationLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationLogs />)
    expect(baseElement).toBeTruthy()
  })
})
