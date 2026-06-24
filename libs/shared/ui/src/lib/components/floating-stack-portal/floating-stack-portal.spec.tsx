import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { FloatingStackPortal } from './floating-stack-portal'

describe('FloatingStackPortal', () => {
  it('should render its children into the shared floating stack root', () => {
    renderWithProviders(
      <FloatingStackPortal>
        <span>Floating content</span>
      </FloatingStackPortal>
    )

    expect(screen.getByText('Floating content')).toBeInTheDocument()
    expect(document.getElementById('qovery-floating-stack')).not.toBeNull()
  })

  it('should reuse the same root for multiple portals', () => {
    renderWithProviders(
      <>
        <FloatingStackPortal position="top">
          <span>Top content</span>
        </FloatingStackPortal>
        <FloatingStackPortal position="bottom">
          <span>Bottom content</span>
        </FloatingStackPortal>
      </>
    )

    expect(screen.getByText('Top content')).toBeInTheDocument()
    expect(screen.getByText('Bottom content')).toBeInTheDocument()
    expect(document.querySelectorAll('#qovery-floating-stack')).toHaveLength(1)
  })
})
