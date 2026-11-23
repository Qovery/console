import { mockPointerCoarse, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Popover } from './popover'

function renderPopover() {
  return renderWithProviders(
    <Popover.Root defaultOpen>
      <Popover.Trigger>
        <button type="button">Open</button>
      </Popover.Trigger>
      <Popover.Content aria-label="popover">
        <input aria-label="search" />
      </Popover.Content>
    </Popover.Root>
  )
}

describe('Popover', () => {
  it('should focus the first field when it opens', () => {
    renderPopover()
    expect(screen.getByLabelText('search')).toHaveFocus()
  })

  it('should focus the popover itself on touch screens, so the virtual keyboard stays closed', () => {
    const restorePointer = mockPointerCoarse()
    renderPopover()
    expect(screen.getByLabelText('search')).not.toHaveFocus()
    expect(screen.getByRole('dialog')).toHaveFocus()
    restorePointer()
  })
})
