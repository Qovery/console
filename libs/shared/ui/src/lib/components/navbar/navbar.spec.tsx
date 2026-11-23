import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Navbar } from './navbar'

function renderNavbar(activeId = 'projects') {
  return renderWithProviders(
    <Navbar.Root activeId={activeId}>
      <Navbar.Item id="projects" href="#projects">
        Projects
      </Navbar.Item>
      <Navbar.Item id="clusters" href="#clusters">
        Clusters
      </Navbar.Item>
      <Navbar.Item id="settings" href="#settings">
        Settings
      </Navbar.Item>
    </Navbar.Root>
  )
}

describe('Navbar', () => {
  it('should mark the active item', () => {
    renderNavbar('clusters')

    const clusters = screen.getByRole('link', { name: 'Clusters' })
    expect(clusters).toHaveAttribute('aria-current', 'page')
    expect(clusters).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('link', { name: 'Projects' })).not.toHaveAttribute('aria-current')
  })

  it('should move focus between items with arrow, Home and End keys', async () => {
    const { userEvent } = renderNavbar()

    screen.getByRole('link', { name: 'Projects' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('link', { name: 'Clusters' })).toHaveFocus()

    await userEvent.keyboard('{End}')
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus()

    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveFocus()

    await userEvent.keyboard('{Home}')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus()
  })

  describe('when the tabs overflow', () => {
    const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect

    beforeEach(() => {
      // A 300px wide scroller whose active tab sits at 500-600px, out of view
      HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
        if (this.getAttribute('data-active') === 'true') {
          return { left: 500, right: 600, width: 100 } as DOMRect
        }
        if (this.firstElementChild?.getAttribute('role') === 'group') {
          return { left: 0, right: 300, width: 300 } as DOMRect
        }
        return { left: 0, right: 0, width: 0 } as DOMRect
      }
    })

    afterEach(() => {
      HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect
    })

    it('should scroll the active tab into view', () => {
      renderNavbar('settings')

      const scroller = screen.getByRole('group').parentElement as HTMLElement
      expect(scroller.scrollLeft).toBe(316)
    })
  })
})
