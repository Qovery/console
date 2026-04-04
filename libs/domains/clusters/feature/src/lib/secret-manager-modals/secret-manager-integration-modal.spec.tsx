import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  SecretManagerIntegrationModal,
  type SecretManagerIntegrationModalProps,
} from './secret-manager-integration-modal'

const defaultProps: SecretManagerIntegrationModalProps = {
  option: {
    value: 'aws-manager',
    label: 'AWS Secret manager',
    icon: 'AWS',
    typeLabel: 'AWS Secret manager',
  },
  regionOptions: [{ label: 'Paris (eu-west-3)', value: 'eu-west-3' }],
  clusterProvider: 'AWS',
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
  })

  it('should force static credentials when an automatic integration already exists', async () => {
    const { userEvent } = renderWithProviders(
      <SecretManagerIntegrationModal {...defaultProps} hasAwsAutomaticIntegrationConfigured />
    )

    expect(screen.getByLabelText('Authentication type')).toBeDisabled()
    expect(screen.getByText('Static credentials')).toBeInTheDocument()

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

  it('should force static credentials when an STS integration already exists', async () => {
    const { userEvent } = renderWithProviders(
      <SecretManagerIntegrationModal {...defaultProps} hasAwsManualStsIntegrationConfigured />
    )

    expect(screen.getByLabelText('Authentication type')).toBeDisabled()
    expect(screen.getByText('Static credentials')).toBeInTheDocument()

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
