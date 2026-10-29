import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BuildOptimizerButton, SAMPLE_ANALYSIS_DURATION_MS } from './build-optimizer-button'

describe('BuildOptimizerButton', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('is disabled until the build succeeded', () => {
    renderWithProviders(<BuildOptimizerButton isBuildSucceeded={false} />)

    expect(screen.getByRole('button', { name: 'Optimize' })).toBeDisabled()
  })

  it('analyzes the build, opens the analysis, then reopens it', async () => {
    jest.useFakeTimers()
    const { userEvent } = renderWithProviders(<BuildOptimizerButton isBuildSucceeded />)

    await userEvent.click(screen.getByRole('button', { name: 'Optimize' }))
    expect(screen.getByRole('button', { name: 'Analyzing' })).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(SAMPLE_ANALYSIS_DURATION_MS)
    })
    expect(screen.getByRole('heading', { name: 'Build optimization analysis' })).toBeInTheDocument()

    // The footer button, not the modal's close icon
    await userEvent.click(screen.getByText('Close', { selector: 'button' }))
    expect(screen.queryByRole('heading', { name: 'Build optimization analysis' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Open analysis' }))
    expect(screen.getByRole('heading', { name: 'Build optimization analysis' })).toBeInTheDocument()
  })
})
