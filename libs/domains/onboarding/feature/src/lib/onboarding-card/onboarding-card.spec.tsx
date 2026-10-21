import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { OnboardingCard } from './onboarding-card'

describe('OnboardingCard', () => {
  it('keeps automatic height when ResizeObserver is unavailable', () => {
    const { rerender } = renderWithProviders(<div />)
    const resizeObserver = window.ResizeObserver
    const measure = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      height: 200,
    } as DOMRect)
    window.ResizeObserver = undefined as unknown as typeof ResizeObserver

    try {
      rerender(
        <OnboardingCard step={1}>
          <p>Profile</p>
        </OnboardingCard>
      )

      const card = screen.getByText('Profile').parentElement?.parentElement
      expect(card).toHaveStyle({ height: 'auto' })

      measure.mockReturnValue({ height: 500 } as DOMRect)
      rerender(
        <OnboardingCard step={2}>
          <p>Choose your cluster</p>
        </OnboardingCard>
      )

      expect(screen.getByText('Choose your cluster')).toBeVisible()
      expect(card).toHaveStyle({ height: 'auto' })
    } finally {
      window.ResizeObserver = resizeObserver
      measure.mockRestore()
    }
  })
})
