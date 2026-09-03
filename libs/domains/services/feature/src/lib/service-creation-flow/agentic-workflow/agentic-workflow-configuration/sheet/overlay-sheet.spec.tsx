import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { OverlaySheet, SheetHeader } from './overlay-sheet'

describe('OverlaySheet', () => {
  it('renders its header and children', () => {
    renderWithProviders(
      <OverlaySheet onClose={jest.fn()}>
        <SheetHeader title="Manage MCP" description="Pick the MCPs" onClose={jest.fn()} />
        <p>Sheet body</p>
      </OverlaySheet>
    )

    expect(screen.getByRole('heading', { name: 'Manage MCP' })).toBeInTheDocument()
    expect(screen.getByText('Pick the MCPs')).toBeInTheDocument()
    expect(screen.getByText('Sheet body')).toBeInTheDocument()
  })

  it('closes from the header close button', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(
      <OverlaySheet onClose={onClose}>
        <SheetHeader title="Manage MCP" onClose={onClose} />
      </OverlaySheet>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })
})
