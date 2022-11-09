import { render } from '__tests__/utils/setup-jest'
import PageApplicationLogs from './page-application-logs'

describe('PageApplicationLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationLogs />)
    expect(baseElement).toBeTruthy()
  })
})
