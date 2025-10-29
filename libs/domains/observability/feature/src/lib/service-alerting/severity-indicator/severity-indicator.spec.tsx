import { AlertSeverity } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { SeverityIndicator, type SeverityIndicatorProps } from './severity-indicator'

describe('SeverityIndicator', () => {
  const props: SeverityIndicatorProps = {
    severity: AlertSeverity.WARNING,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SeverityIndicator {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render correct number of bars for MEDIUM severity', () => {
    const { container } = renderWithProviders(<SeverityIndicator severity={AlertSeverity.WARNING} />)
    const bars = container.querySelectorAll('.h-3.w-0\\.5')
    expect(bars).toHaveLength(5)
    expect(container).toHaveTextContent('Medium')
  })

  it('should render correct number of bars for CRITICAL severity', () => {
    const { container } = renderWithProviders(<SeverityIndicator severity={AlertSeverity.CRITICAL} />)
    const bars = container.querySelectorAll('.h-3.w-0\\.5')
    expect(bars).toHaveLength(5)
    expect(container).toHaveTextContent('Critical')
  })
})
