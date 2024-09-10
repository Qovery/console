import { renderWithProviders } from '@qovery/shared/util-tests'
import ListServiceLogs from './list-service-logs'

describe('ListServiceLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ListServiceLogs />)
    expect(baseElement).toBeTruthy()
  })
})
