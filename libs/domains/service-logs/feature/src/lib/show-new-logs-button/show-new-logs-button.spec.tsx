import { renderWithProviders } from '@qovery/shared/util-tests'
import { ShowNewLogsButton } from './show-new-logs-button'

describe('ShowNewLogsButton', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ShowNewLogsButton />)
    expect(baseElement).toBeTruthy()
  })
})
