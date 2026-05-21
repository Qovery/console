import {
  hasAwsAutomaticIntegrationConfigured,
  hasAwsManualStsIntegrationConfigured,
} from '@qovery/shared/util-clusters'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  SecretManagerIntegrationModal,
  type SecretManagerIntegrationModalProps,
} from './secret-manager-integration-modal'

jest.mock('@qovery/shared/util-clusters', () => ({
  ...jest.requireActual('@qovery/shared/util-clusters'),
  hasAwsAutomaticIntegrationConfigured: jest.fn(),
  hasAwsManualStsIntegrationConfigured: jest.fn(),
}))

const defaultProps: SecretManagerIntegrationModalProps = {
  option: {
    value: 'AWS_SECRET_MANAGER',
    label: 'AWS Secret manager',
    icon: 'AWS',
    typeLabel: 'AWS Secret manager',
  },
  regionOptions: [{ label: 'Paris (eu-west-3)', value: 'eu-west-3' }],
  onClose: jest.fn(),
  onSubmit: jest.fn(),
}

const getAutomaticTab = () => {
  const automaticIntegrationLabel = screen.getByText('Automatic integration')
  return (automaticIntegrationLabel.closest('[aria-disabled="true"]') ??
    automaticIntegrationLabel.closest('[aria-disabled]')) as HTMLElement
}

describe('SecretManagerIntegrationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(hasAwsAutomaticIntegrationConfigured).mockReturnValue(false)
    jest.mocked(hasAwsManualStsIntegrationConfigured).mockReturnValue(false)
  })

  it('should force static credentials when an automatic integration already exists', async () => {
    jest.mocked(hasAwsAutomaticIntegrationConfigured).mockReturnValue(true)

    const { userEvent } = renderWithProviders(<SecretManagerIntegrationModal {...defaultProps} />)

    expect(screen.getByLabelText('Authentication type')).toBeDisabled()
    expect(screen.getByText('Manual integration').closest('a')).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText('Assume role via STS')).not.toBeInTheDocument()

    const automaticTab = getAutomaticTab()
    expect(automaticTab).toHaveAttribute('aria-disabled')

    await userEvent.hover(automaticTab)

    expect(
      (
        await screen.findAllByText(
          'Static credentials are the only available option while Automatic integration is configured'
        )
      ).length
    ).toBeGreaterThan(0)
  })

  it('should include authentication in the payload for automatic integration', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(<SecretManagerIntegrationModal {...defaultProps} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Secret manager name'), 'Prod secrets')
    await userEvent.click(screen.getByRole('button', { name: 'Add secret manager' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Prod secrets',
        authentication: { mode: 'AUTOMATICALLY_CONFIGURED' },
      })
    )
  })

  it('should force static credentials when an STS integration already exists', async () => {
    jest.mocked(hasAwsManualStsIntegrationConfigured).mockReturnValue(true)

    const { userEvent } = renderWithProviders(<SecretManagerIntegrationModal {...defaultProps} />)

    expect(screen.getByLabelText('Authentication type')).toBeDisabled()
    expect(screen.getByText('Manual integration').closest('a')).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText('Assume role via STS')).not.toBeInTheDocument()

    const automaticTab = getAutomaticTab()
    expect(automaticTab).toHaveAttribute('aria-disabled')

    await userEvent.hover(automaticTab)

    expect(
      (
        await screen.findAllByText(
          'Static credentials are the only available option while Assume role integration is configured'
        )
      ).length
    ).toBeGreaterThan(0)
  })
})
