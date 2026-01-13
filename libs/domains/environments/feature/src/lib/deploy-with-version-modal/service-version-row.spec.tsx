import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceVersionRow, type ServiceVersionSelection } from './service-version-row'

const mockService: ServiceVersionSelection = {
  id: 'service-1',
  name: 'Test Application',
  serviceType: 'APPLICATION',
  sourceType: 'git',
  isSelected: false,
  selectedVersion: undefined,
  currentVersion: {
    type: 'commit',
    value: 'abc1234567890',
    displayValue: 'abc1234',
  },
}

describe('ServiceVersionRow', () => {
  const defaultProps = {
    service: mockService,
    organizationId: 'org-1',
    isChecked: false,
    onToggle: jest.fn(),
    onVersionChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render service name and type', () => {
    renderWithProviders(<ServiceVersionRow {...defaultProps} />)

    expect(screen.getByText('Test Application')).toBeInTheDocument()
    expect(screen.getByText('Application')).toBeInTheDocument()
  })

  it('should render current version', () => {
    renderWithProviders(<ServiceVersionRow {...defaultProps} />)

    expect(screen.getByText('Current:')).toBeInTheDocument()
  })

  it('should call onToggle when row is clicked', async () => {
    const onToggle = jest.fn()
    const { userEvent } = renderWithProviders(<ServiceVersionRow {...defaultProps} onToggle={onToggle} />)

    // Get the row button (not the "Select version" button)
    const rowButton = screen.getAllByRole('button')[0]
    await userEvent.click(rowButton)
    expect(onToggle).toHaveBeenCalled()
  })

  it('should render select version button for git-based services', () => {
    renderWithProviders(<ServiceVersionRow {...defaultProps} />)

    expect(screen.getByText('Select version')).toBeInTheDocument()
  })

  it('should not render select version button for database services', () => {
    const databaseService: ServiceVersionSelection = {
      ...mockService,
      serviceType: 'DATABASE',
      sourceType: 'database',
    }

    renderWithProviders(<ServiceVersionRow {...defaultProps} service={databaseService} />)

    expect(screen.queryByText('Select version')).not.toBeInTheDocument()
  })

  it('should show Change button when version is selected', () => {
    const serviceWithVersion: ServiceVersionSelection = {
      ...mockService,
      selectedVersion: {
        type: 'commit',
        value: 'def4567890123',
        displayValue: 'def4567',
      },
    }

    renderWithProviders(<ServiceVersionRow {...defaultProps} service={serviceWithVersion} />)

    expect(screen.getByText('Change')).toBeInTheDocument()
  })

  it('should apply checked styling when isChecked is true', () => {
    const { container } = renderWithProviders(<ServiceVersionRow {...defaultProps} isChecked />)

    expect(container.firstChild).toHaveClass('border-brand-500')
  })
})
