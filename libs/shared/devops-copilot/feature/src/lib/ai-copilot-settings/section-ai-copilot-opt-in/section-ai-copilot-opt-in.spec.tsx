import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { SectionAICopilotOptIn } from './section-ai-copilot-opt-in'

describe('SectionAICopilotOptIn', () => {
  const mockOrganization = organizationFactoryMock(1)[0]
  const mockOnEnable = jest.fn()

  const defaultProps = {
    organization: mockOrganization,
    isLoading: false,
    onEnable: mockOnEnable,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkbox interaction', () => {
    it('should enable submit button when checkbox is checked', async () => {
      const { userEvent } = renderWithProviders(<SectionAICopilotOptIn {...defaultProps} />)

      const checkbox = screen.getByRole('checkbox')
      await userEvent.click(checkbox)

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /enable ai copilot/i })
        expect(submitButton).toBeEnabled()
      })
    })

    it('should disable submit button when checkbox is unchecked after being checked', async () => {
      const { userEvent } = renderWithProviders(<SectionAICopilotOptIn {...defaultProps} />)

      const checkbox = screen.getByRole('checkbox')
      await userEvent.click(checkbox)
      await userEvent.click(checkbox)

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /enable ai copilot/i })
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('form submission', () => {
    it('should call onEnable when form is submitted', async () => {
      const { userEvent } = renderWithProviders(<SectionAICopilotOptIn {...defaultProps} />)

      const checkbox = screen.getByRole('checkbox')
      await userEvent.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /enable ai copilot/i })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnEnable).toHaveBeenCalled()
      })
    })

    it('should not call onEnable when checkbox is not checked', async () => {
      const { userEvent } = renderWithProviders(<SectionAICopilotOptIn {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /enable ai copilot/i })
      await userEvent.click(submitButton)

      expect(mockOnEnable).not.toHaveBeenCalled()
    })
  })
})
