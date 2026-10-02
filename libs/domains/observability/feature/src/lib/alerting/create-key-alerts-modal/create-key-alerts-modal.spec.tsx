import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CreateKeyAlertsModal } from './create-key-alerts-modal'

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(),
}))

const mockUseFeatureFlagEnabled = jest.mocked(useFeatureFlagEnabled)
const mockOnClose = jest.fn()
const mockUseRdsAlertTarget = jest.fn()

jest.mock('../../hooks/use-rds-alert-target/use-rds-alert-target', () => ({
  useRdsAlertTarget: () => mockUseRdsAlertTarget(),
}))

describe('CreateKeyAlertsModal', () => {
  const defaultProps = {
    onClose: mockOnClose,
    projectId: 'project-123',
    organizationId: 'org-123',
  }

  const defaultService = {
    id: 'service-123',
    name: 'My Service',
    serviceType: 'APPLICATION',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseFeatureFlagEnabled.mockReturnValue(false)
    mockUseRdsAlertTarget.mockReturnValue({ isRds: false, isResolving: false })
  })

  it('should render all metric categories when certificate renewal alerts are enabled', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(true)
    renderWithProviders(<CreateKeyAlertsModal {...defaultProps} />)

    expect(screen.getByText('CPU')).toBeInTheDocument()
    expect(screen.getByText('Memory')).toBeInTheDocument()
    expect(screen.getByText('Missing instance')).toBeInTheDocument()
    expect(screen.getByText('Instance restart')).toBeInTheDocument()
    expect(screen.getByText('Certificate renewal failed')).toBeInTheDocument()
  })

  it('should hide certificate renewal alerts for services that cannot own custom domains', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(true)
    renderWithProviders(
      <CreateKeyAlertsModal
        {...defaultProps}
        service={{ ...defaultService, serviceType: 'DATABASE' } as unknown as AnyService}
      />
    )

    expect(screen.queryByText('Certificate renewal failed')).not.toBeInTheDocument()
  })

  it.each([false, undefined])('should hide certificate renewal alerts when the flag is %s', (enabled) => {
    mockUseFeatureFlagEnabled.mockReturnValue(enabled)
    renderWithProviders(<CreateKeyAlertsModal {...defaultProps} service={defaultService as AnyService} />)

    expect(mockUseFeatureFlagEnabled).toHaveBeenCalledWith('certificate-renewal-alert')
    expect(screen.queryByRole('button', { name: 'Certificate renewal failed' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'CPU', exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Memory', exact: true })).toBeInTheDocument()
  })

  it.each(['APPLICATION', 'CONTAINER', 'HELM'] as const)(
    'should show certificate renewal alerts for %s when enabled',
    (serviceType) => {
      mockUseFeatureFlagEnabled.mockReturnValue(true)
      renderWithProviders(
        <CreateKeyAlertsModal {...defaultProps} service={{ ...defaultService, serviceType } as AnyService} />
      )

      expect(screen.getByRole('button', { name: 'Certificate renewal failed' })).toBeInTheDocument()
    }
  )

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

  it('offers only the four RDS metrics for an RDS blueprint service', () => {
    mockUseRdsAlertTarget.mockReturnValue({
      isRds: true,
      isResolving: false,
      dbInstance: 'z04d06b19-postgresql',
      hasCloudWatchMetrics: true,
    })
    renderWithProviders(<CreateKeyAlertsModal {...defaultProps} service={defaultService as AnyService} />)

    expect(screen.getByRole('button', { name: 'RDS CPU utilization' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'RDS connections' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'RDS freeable memory' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'RDS free storage space' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Missing instance' })).not.toBeInTheDocument()
  })

  it('requires CloudWatch metrics before configuring RDS alerts', async () => {
    mockUseRdsAlertTarget.mockReturnValue({
      isRds: true,
      isResolving: false,
      dbInstance: 'db-1',
      hasCloudWatchMetrics: false,
    })
    const { userEvent } = renderWithProviders(
      <CreateKeyAlertsModal {...defaultProps} service={defaultService as AnyService} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'RDS CPU utilization' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enable CloudWatch metrics')
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('does not offer generic alerts when RDS metadata fails to load', () => {
    mockUseRdsAlertTarget.mockReturnValue({ isRds: false, isResolving: false, isMetadataUnavailable: true })
    renderWithProviders(<CreateKeyAlertsModal {...defaultProps} service={defaultService as AnyService} />)

    expect(screen.getByRole('alert')).toHaveTextContent("Unable to load this database's alert target")
    expect(screen.queryByRole('button', { name: 'CPU', exact: true })).not.toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })
})
