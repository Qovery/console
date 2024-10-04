import { renderWithProviders } from '@qovery/shared/util-tests'
import HeaderLogs from './header-logs'

describe('HeaderLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<HeaderLogs />)
    expect(baseElement).toBeTruthy()
  })
})
