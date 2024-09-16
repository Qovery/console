import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ShowNewLogsButton } from './show-new-logs-button'

describe('ShowNewLogsButton', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ShowNewLogsButton pauseLogs={true} setPauseLogs={jest.fn()} newMessagesAvailable={true} />
    )
    expect(baseElement).toBeTruthy()
  })

  it('calls setPauseLogs with false when button is clicked', async () => {
    const setPauseLogs = jest.fn()
    const { userEvent } = renderWithProviders(
      <ShowNewLogsButton pauseLogs={true} newMessagesAvailable={true} setPauseLogs={setPauseLogs} />
    )

    const button = screen.getByRole('button', { name: /new logs/i })
    await userEvent.click(button)
    expect(setPauseLogs).toHaveBeenCalledWith(false)
  })
})
