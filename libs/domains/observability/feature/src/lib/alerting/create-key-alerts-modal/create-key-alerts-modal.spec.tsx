import { type AnyService } from '@qovery/domains/services/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CreateKeyAlertsModal } from './create-key-alerts-modal'

const mockOnClose = jest.fn()

describe('CreateKeyAlertsModal', () => {
  const defaultProps = {
    onClose: mockOnClose,
    projectId: 'project-123',
    organizationId: 'org-123',
  }

  const defaultService = {
    id: 'service-123',
    name: 'My Service',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all metric categories', () => {
    renderWithProviders(<CreateKeyAlertsModal {...defaultProps} />)

    expect(screen.getByText('CPU')).toBeInTheDocument()
    expect(screen.getByText('Memory')).toBeInTheDocument()
    expect(screen.getByText('HTTP error')).toBeInTheDocument()
    expect(screen.getByText('Replicas number')).toBeInTheDocument()
    expect(screen.getByText('k8s event')).toBeInTheDocument()
    expect(screen.getByText('HPA issue')).toBeInTheDocument()
  })

  it('should pre-fill service name when service prop is provided', () => {
    renderWithProviders(<CreateKeyAlertsModal {...defaultProps} service={defaultService as AnyService} />)

    const input = screen.getByDisplayValue('My Service')
    expect(input).toBeInTheDocument()
    expect(input).toBeDisabled()
  })

  it('should render submit button with correct label', () => {
    renderWithProviders(<CreateKeyAlertsModal {...defaultProps} />)

    expect(screen.getByText('Configure alerts')).toBeInTheDocument()
  })
})
