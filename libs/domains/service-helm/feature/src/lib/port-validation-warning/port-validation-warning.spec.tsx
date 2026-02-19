import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PortValidationWarning } from './port-validation-warning'

describe('PortValidationWarning', () => {
  describe('SERVICE_NOT_DEPLOYED reason', () => {
    it('should render yellow callout with deployment message', () => {
      renderWithProviders(<PortValidationWarning reason="SERVICE_NOT_DEPLOYED" />)

      expect(screen.getByText('Port validation unavailable')).toBeInTheDocument()
      expect(screen.getByText('Port validation will be available after deployment.')).toBeInTheDocument()
    })

    it('should match snapshot', () => {
      const { baseElement } = renderWithProviders(<PortValidationWarning reason="SERVICE_NOT_DEPLOYED" />)
      expect(baseElement).toMatchSnapshot()
    })
  })

  describe('SERVICE_STOPPED reason', () => {
    it('should render yellow callout with stopped message', () => {
      renderWithProviders(<PortValidationWarning reason="SERVICE_STOPPED" />)

      expect(screen.getByText('Port validation unavailable')).toBeInTheDocument()
      expect(screen.getByText('Port validation requires the helm chart to be deployed.')).toBeInTheDocument()
    })

    it('should match snapshot', () => {
      const { baseElement } = renderWithProviders(<PortValidationWarning reason="SERVICE_STOPPED" />)
      expect(baseElement).toMatchSnapshot()
    })
  })

  describe('API_ERROR reason', () => {
    it('should render red callout with error message', () => {
      renderWithProviders(<PortValidationWarning reason="API_ERROR" />)

      expect(screen.getByText('Unable to validate ports')).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch Kubernetes services. Please try again.')).toBeInTheDocument()
    })

    it('should show retry button when onRetry is provided', () => {
      const onRetry = jest.fn()
      renderWithProviders(<PortValidationWarning reason="API_ERROR" onRetry={onRetry} />)

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', async () => {
      const onRetry = jest.fn()
      const { userEvent } = renderWithProviders(<PortValidationWarning reason="API_ERROR" onRetry={onRetry} />)

      await userEvent.click(screen.getByRole('button', { name: /retry/i }))

      expect(onRetry).toHaveBeenCalled()
    })

    it('should not show retry button when onRetry is not provided', () => {
      renderWithProviders(<PortValidationWarning reason="API_ERROR" />)

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
    })

    it('should match snapshot with retry button', () => {
      const { baseElement } = renderWithProviders(<PortValidationWarning reason="API_ERROR" onRetry={jest.fn()} />)
      expect(baseElement).toMatchSnapshot()
    })
  })

  describe('API_TIMEOUT reason', () => {
    it('should render yellow callout with timeout message', () => {
      renderWithProviders(<PortValidationWarning reason="API_TIMEOUT" />)

      expect(screen.getByText('Validation timed out')).toBeInTheDocument()
      expect(screen.getByText('Port validation request timed out. Please try again.')).toBeInTheDocument()
    })

    it('should show retry button when onRetry is provided', () => {
      const onRetry = jest.fn()
      renderWithProviders(<PortValidationWarning reason="API_TIMEOUT" onRetry={onRetry} />)

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('should match snapshot', () => {
      const { baseElement } = renderWithProviders(<PortValidationWarning reason="API_TIMEOUT" onRetry={jest.fn()} />)
      expect(baseElement).toMatchSnapshot()
    })
  })
})
