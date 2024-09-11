import { renderWithProviders } from '@qovery/shared/util-tests'
import { NewLogsButton } from './new-logs-button'

describe('NewLogsButton', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<NewLogsButton />)
    expect(baseElement).toBeTruthy()
  })
})
