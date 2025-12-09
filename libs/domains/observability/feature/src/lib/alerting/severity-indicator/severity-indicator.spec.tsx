import { AlertSeverity } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { SeverityIndicator, type SeverityIndicatorProps } from './severity-indicator'

describe('SeverityIndicator', () => {
  const props: SeverityIndicatorProps = {
    severity: AlertSeverity.MEDIUM,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SeverityIndicator {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render correct number of bars for LOW severity', () => {
    const { container } = renderWithProviders(<SeverityIndicator severity={AlertSeverity.LOW} />)
    expect(container).toHaveTextContent('Low')
  })

  it('should render correct number of bars for MEDIUM severity', () => {
    const { container } = renderWithProviders(<SeverityIndicator severity={AlertSeverity.MEDIUM} />)
    expect(container).toHaveTextContent('Medium')
  })

  it('should render correct number of bars for HIGH severity', () => {
    const { container } = renderWithProviders(<SeverityIndicator severity={AlertSeverity.HIGH} />)
    expect(container).toHaveTextContent('High')
  })

  it('should render correct number of bars for CRITICAL severity', () => {
    const { container } = renderWithProviders(<SeverityIndicator severity={AlertSeverity.CRITICAL} />)
    expect(container).toHaveTextContent('Critical')
  })
})
