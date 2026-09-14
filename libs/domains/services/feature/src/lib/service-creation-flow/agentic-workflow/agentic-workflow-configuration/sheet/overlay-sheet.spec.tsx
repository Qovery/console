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
    expect(screen.getByRole('heading', { name: 'Manage MCP' }).closest('header')).not.toHaveClass('border-b')
    expect(screen.getByText('Pick the MCPs')).toBeInTheDocument()
    expect(screen.getByText('Sheet body')).toBeInTheDocument()
  })

  it('renders an optional full-width header divider', () => {
    renderWithProviders(
      <OverlaySheet onClose={jest.fn()}>
        <SheetHeader withDivider title="Configure triggers" onClose={jest.fn()} />
      </OverlaySheet>
    )

    expect(screen.getByRole('heading', { name: 'Configure triggers' }).closest('header')).toHaveClass(
      'border-b',
      'border-neutral'
    )
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
