import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintUpdateFlowShell } from './blueprint-update-flow-shell'

describe('BlueprintUpdateFlowShell', () => {
  it('renders the active step and its content', () => {
    renderWithProviders(
      <BlueprintUpdateFlowShell currentStep={2} onExit={jest.fn()}>
        <div>Step content</div>
      </BlueprintUpdateFlowShell>
    )

    expect(screen.getByText('Review update')).toBeInTheDocument()
    expect(screen.getByText('Preview changes')).toBeInTheDocument()
    expect(screen.getByText('Step content')).toBeInTheDocument()
  })

  it('calls onExit when the close button is clicked', async () => {
    const onExit = jest.fn()
    const { userEvent } = renderWithProviders(
      <BlueprintUpdateFlowShell currentStep={1} onExit={onExit}>
        <div />
      </BlueprintUpdateFlowShell>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onExit).toHaveBeenCalledTimes(1)
  })
})
