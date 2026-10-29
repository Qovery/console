import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SAMPLE_BUILD_OPTIMIZATION_ANALYSIS } from './build-optimization-analysis'
import { BuildOptimizationModal } from './build-optimization-modal'

describe('BuildOptimizationModal', () => {
  it('shows the analysis', () => {
    renderWithProviders(<BuildOptimizationModal analysis={SAMPLE_BUILD_OPTIMIZATION_ANALYSIS} onClose={jest.fn()} />)

    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('50s – 1min 30s')).toBeInTheDocument()
    expect(screen.getByText('.dockerignore')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(7)
  })

  it('shows the prompt for AI agents once expanded', async () => {
    const { userEvent } = renderWithProviders(
      <BuildOptimizationModal analysis={SAMPLE_BUILD_OPTIMIZATION_ANALYSIS} onClose={jest.fn()} />
    )

    const promptToggle = screen.getByRole('button', { name: 'Prompt for AI agents' })
    expect(screen.queryByText(/Speed up the Docker build/)).not.toBeInTheDocument()

    await userEvent.click(promptToggle)

    expect(promptToggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Speed up the Docker build/)).toBeInTheDocument()
  })

  it('closes', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(
      <BuildOptimizationModal analysis={SAMPLE_BUILD_OPTIMIZATION_ANALYSIS} onClose={onClose} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })
})
