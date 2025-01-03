import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AnimatedGradientText } from './animated-gradient-text'

describe('AnimatedGradientText', () => {
  it('renders children correctly', () => {
    const testText = 'Hello World'
    renderWithProviders(<AnimatedGradientText>{testText}</AnimatedGradientText>)
    expect(screen.getByText(testText)).toBeInTheDocument()
  })

  it('sets correct shimmer width style variable', () => {
    const shimmerWidth = 200
    const { container } = renderWithProviders(
      <AnimatedGradientText shimmerWidth={shimmerWidth}>Test</AnimatedGradientText>
    )
    const element = container.firstChild as HTMLElement
    expect(element.style.getPropertyValue('--shiny-width')).toBe('200px')
  })
})
