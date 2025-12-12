import { organizationFactoryMock } from '@qovery/shared/factories'
import { render, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { SectionAICopilotConfiguration } from './section-ai-copilot-configuration'

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: jest.fn(),
    closeModal: jest.fn(),
  }),
}))

describe('SectionAICopilotConfiguration', () => {
  const mockOrganization = organizationFactoryMock(1)[0]
  const mockOnModeChange = jest.fn()
  const mockOnDisable = jest.fn()

  const defaultProps = {
    organization: mockOrganization,
    isLoading: false,
    isUpdating: false,
    currentMode: 'read-only' as const,
    onModeChange: mockOnModeChange,
    onDisable: mockOnDisable,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render section heading', () => {
    render(<SectionAICopilotConfiguration {...defaultProps} />)

    expect(screen.getByText('AI Copilot Configuration')).toBeInTheDocument()
    expect(screen.getByText('Configure your Copilot')).toBeInTheDocument()
  })

  it('should show loader when loading', () => {
    const { container } = render(<SectionAICopilotConfiguration {...defaultProps} isLoading={true} />)

    expect(container.querySelector('.w-5')).toBeInTheDocument()
  })

  it('should display organization name', () => {
    render(<SectionAICopilotConfiguration {...defaultProps} />)

    expect(screen.getByText(`AI Copilot for ${mockOrganization.name}`)).toBeInTheDocument()
  })

  it('should display current mode', () => {
    render(<SectionAICopilotConfiguration {...defaultProps} currentMode="read-only" />)

    expect(screen.getByText('Read-Only Mode')).toBeInTheDocument()
    expect(
      screen.getByText(/AI Copilot can view your infrastructure configuration but cannot make changes/)
    ).toBeInTheDocument()
  })

  it('should display read-write mode description', () => {
    render(<SectionAICopilotConfiguration {...defaultProps} currentMode="read-write" />)

    expect(screen.getByText('Read-Write Mode')).toBeInTheDocument()
    expect(screen.getByText(/AI Copilot can view and modify your infrastructure configuration/)).toBeInTheDocument()
  })

  it('should show save buttons when mode is changed', async () => {
    const { userEvent } = renderWithProviders(
      <SectionAICopilotConfiguration {...defaultProps} currentMode="read-only" />
    )

    const select = screen.getByLabelText('Right access')
    await userEvent.click(select)

    const readWriteOption = screen.getByText('Read-Write')
    await userEvent.click(readWriteOption)

    await waitFor(() => {
      expect(screen.getByText('Save changes')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  it('should call onModeChange when saving mode change', async () => {
    const { userEvent } = renderWithProviders(
      <SectionAICopilotConfiguration {...defaultProps} currentMode="read-only" />
    )

    const select = screen.getByLabelText('Right access')
    await userEvent.click(select)

    const readWriteOption = screen.getByText('Read-Write')
    await userEvent.click(readWriteOption)

    const saveButton = await screen.findByText('Save changes')
    await userEvent.click(saveButton)

    expect(mockOnModeChange).toHaveBeenCalledWith('read-write')
  })

  it('should reset selection when canceling mode change', async () => {
    const { userEvent } = renderWithProviders(
      <SectionAICopilotConfiguration {...defaultProps} currentMode="read-only" />
    )

    const select = screen.getByLabelText('Right access')
    await userEvent.click(select)

    const readWriteOption = screen.getByText('Read-Write')
    await userEvent.click(readWriteOption)

    const cancelButton = await screen.findByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('Save changes')).not.toBeInTheDocument()
    })
  })

  it('should disable inputs when updating', () => {
    render(<SectionAICopilotConfiguration {...defaultProps} isUpdating={true} />)

    const select = screen.getByLabelText('Right access')
    expect(select).toBeDisabled()
  })

  it('should show loading state on buttons when updating', () => {
    render(<SectionAICopilotConfiguration {...defaultProps} isUpdating={true} />)

    const disableButton = screen.getByRole('button', { name: /disable/i })
    expect(disableButton).toBeInTheDocument()
  })

  it('should render disable button', () => {
    render(<SectionAICopilotConfiguration {...defaultProps} />)

    const disableButton = screen.getByRole('button', { name: /disable/i })
    expect(disableButton).toBeInTheDocument()
  })

  it('should have mode select with correct options', () => {
    render(<SectionAICopilotConfiguration {...defaultProps} />)

    const select = screen.getByLabelText('Right access')
    expect(select).toBeInTheDocument()
  })
})
