import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PortValidationStatus } from './port-validation-status'

describe('PortValidationStatus', () => {
  describe('valid status', () => {
    it('should render green check icon', () => {
      renderWithProviders(<PortValidationStatus status="valid" />)

      const icon = screen.getByTestId('port-validation-icon')
      expect(icon).toHaveClass('text-green-500')
    })

    it('should match snapshot', () => {
      const { baseElement } = renderWithProviders(<PortValidationStatus status="valid" />)
      expect(baseElement).toMatchSnapshot()
    })
  })

  describe('invalid status', () => {
    it('should render red exclamation icon', () => {
      renderWithProviders(<PortValidationStatus status="invalid" errorMessage="Service not found" />)

      const icon = screen.getByTestId('port-validation-icon')
      expect(icon).toHaveClass('text-red-500')
    })

    it('should show tooltip with error message on hover', async () => {
      const { userEvent } = renderWithProviders(
        <PortValidationStatus status="invalid" errorMessage="Service 'nginx' not found" />
      )

      const trigger = screen.getByTestId('port-validation-trigger')
      await userEvent.hover(trigger)

      // Tooltip content should be visible after hover (getAllByText because tooltip duplicates for accessibility)
      const tooltipTexts = await screen.findAllByText("Service 'nginx' not found")
      expect(tooltipTexts.length).toBeGreaterThan(0)
    })

    it('should match snapshot with error message', () => {
      const { baseElement } = renderWithProviders(
        <PortValidationStatus status="invalid" errorMessage="Service not found" />
      )
      expect(baseElement).toMatchSnapshot()
    })
  })

  describe('unknown status', () => {
    it('should render gray question icon', () => {
      renderWithProviders(<PortValidationStatus status="unknown" />)

      const icon = screen.getByTestId('port-validation-icon')
      expect(icon).toHaveClass('text-neutral-350')
    })

    it('should match snapshot', () => {
      const { baseElement } = renderWithProviders(<PortValidationStatus status="unknown" />)
      expect(baseElement).toMatchSnapshot()
    })
  })

  describe('loading status', () => {
    it('should render loading spinner', () => {
      renderWithProviders(<PortValidationStatus status="loading" />)

      const spinner = screen.getByTestId('port-validation-loading')
      expect(spinner).toBeInTheDocument()
    })

    it('should match snapshot', () => {
      const { baseElement } = renderWithProviders(<PortValidationStatus status="loading" />)
      expect(baseElement).toMatchSnapshot()
    })
  })

  describe('custom className', () => {
    it('should apply custom className', () => {
      renderWithProviders(<PortValidationStatus status="valid" className="custom-class" />)

      const container = screen.getByTestId('port-validation-status')
      expect(container).toHaveClass('custom-class')
    })
  })
})
