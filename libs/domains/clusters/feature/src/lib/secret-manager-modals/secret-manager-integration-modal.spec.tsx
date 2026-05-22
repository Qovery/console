import {
  hasAwsAutomaticIntegrationConfigured,
  hasAwsManualStsIntegrationConfigured,
  hasGcpAutomaticIntegrationConfigured,
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
  hasGcpAutomaticIntegrationConfigured: jest.fn(),
}))

const defaultProps: SecretManagerIntegrationModalProps = {
  option: {
    value: 'AWS_SECRET_MANAGER',
    label: 'AWS Secret manager',
    icon: 'AWS',
    typeLabel: 'AWS Secret manager',
  },
  onClose: jest.fn(),
  onSubmit: jest.fn(),
}

const getAutomaticTab = () => {
  const automaticTab = screen
    .getAllByText('Automatic integration')
    .map((element) => element.closest('a'))
    .find((element): element is HTMLAnchorElement => element !== null)

  if (!automaticTab) {
    throw new Error('Automatic integration tab not found')
  }

  return automaticTab
}

describe('SecretManagerIntegrationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(hasAwsAutomaticIntegrationConfigured).mockReturnValue(false)
    jest.mocked(hasAwsManualStsIntegrationConfigured).mockReturnValue(false)
    jest.mocked(hasGcpAutomaticIntegrationConfigured).mockReturnValue(false)
  })

  it('should force static credentials when an automatic integration already exists', async () => {
    jest.mocked(hasAwsAutomaticIntegrationConfigured).mockReturnValue(true)

    const { userEvent } = renderWithProviders(<SecretManagerIntegrationModal {...defaultProps} />)

    expect(screen.getByText('Manual integration').closest('a')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByLabelText('Authentication type')).toBeDisabled()
    expect(screen.queryByText('Select an authentication type to see the required information.')).not.toBeInTheDocument()
    expect(screen.getByText('How to create new credentials')).toBeInTheDocument()
    expect(screen.queryByText('Assume role via STS')).not.toBeInTheDocument()

    const automaticTab = getAutomaticTab()
    expect(automaticTab).toHaveAttribute('aria-disabled')

    await userEvent.hover(automaticTab)

    expect(
      await screen.findByRole('tooltip', {
        name: 'Static credentials are the only available option while an automatic integration is configured.',
      })
    ).toBeInTheDocument()
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

    expect(screen.getByText('Manual integration').closest('a')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByLabelText('Authentication type')).toBeDisabled()
    expect(screen.queryByText('Assume role via STS')).not.toBeInTheDocument()

    const automaticTab = getAutomaticTab()
    expect(automaticTab).toHaveAttribute('aria-disabled')

    await userEvent.hover(automaticTab)

    expect(
      await screen.findByRole('tooltip', {
        name: 'Static credentials are the only available option while an assume role integration is configured.',
      })
    ).toBeInTheDocument()
  })

  it('should allow assume role when only static credential integrations exist', async () => {
    const { userEvent } = renderWithProviders(<SecretManagerIntegrationModal {...defaultProps} />)

    expect(getAutomaticTab()).not.toHaveAttribute('aria-disabled')

    await userEvent.click(screen.getByText('Manual integration'))

    expect(screen.getByLabelText('Authentication type')).toBeEnabled()
    expect(screen.getByText('Select an authentication type to see the required information.')).toBeInTheDocument()
  })

  it('should disable automatic tab when a GCP automatic integration already exists', async () => {
    jest.mocked(hasGcpAutomaticIntegrationConfigured).mockReturnValue(true)

    const gcpProps: SecretManagerIntegrationModalProps = {
      ...defaultProps,
      option: {
        value: 'GCP_SECRET_MANAGER',
        label: 'GCP Secret manager',
        icon: 'GCP',
        typeLabel: 'GCP Secret manager',
      },
      cluster: {
        cloud_provider: 'GCP',
        secret_manager_accesses: [
          {
            id: 'sm-auto',
            authentication: { mode: 'AUTOMATICALLY_CONFIGURED' },
            endpoint: { mode: 'GCP_SECRET_MANAGER' },
          },
        ],
      } as SecretManagerIntegrationModalProps['cluster'],
    }

    const { userEvent } = renderWithProviders(<SecretManagerIntegrationModal {...gcpProps} />)

    expect(screen.getByText('Manual integration').closest('a')).toHaveAttribute('aria-current', 'page')

    const automaticTab = getAutomaticTab()
    expect(automaticTab).toHaveAttribute('aria-disabled')

    await userEvent.hover(automaticTab)

    expect(
      await screen.findByRole('tooltip', {
        name: 'Automatic integration is unavailable because an automatic integration is already configured.',
      })
    ).toBeInTheDocument()
  })
})
