import { renderWithProviders } from '@qovery/shared/util-tests'
import { ShowPreviousLogsButton } from './show-previous-logs-button'

describe('ShowPreviousLogsButton', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ShowPreviousLogsButton />)
    expect(baseElement).toBeTruthy()
  })
})
