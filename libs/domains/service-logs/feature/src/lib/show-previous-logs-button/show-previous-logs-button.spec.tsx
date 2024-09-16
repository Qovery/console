import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ShowPreviousLogsButton } from './show-previous-logs-button'

describe('ShowPreviousLogsButton', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ShowPreviousLogsButton showPreviousLogs={true} setShowPreviousLogs={jest.fn()} />
    )
    expect(baseElement).toBeTruthy()
  })

  it('calls setShowPreviousLogs with true when button is clicked', async () => {
    const setShowPreviousLogs = jest.fn()
    const { userEvent } = renderWithProviders(
      <ShowPreviousLogsButton showPreviousLogs={false} setShowPreviousLogs={setShowPreviousLogs} />
    )

    const button = screen.getByRole('button', { name: /load previous logs/i })
    await userEvent.click(button)
    expect(setShowPreviousLogs).toHaveBeenCalledWith(true)
  })
})
