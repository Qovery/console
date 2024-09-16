import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ProgressIndicator from './progress-indicator'

describe('ProgressIndicator', () => {
  it('renders with the correct message when logs are not paused', () => {
    const message = 'Streaming logs'
    renderWithProviders(<ProgressIndicator pauseLogs={false} message={message} />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('renders "Streaming paused" when logs are paused', () => {
    renderWithProviders(<ProgressIndicator pauseLogs={true} message="Streaming logs" />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByText('Streaming paused')).toBeInTheDocument()
  })
})
