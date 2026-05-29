import selectEvent from 'react-select-event'
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

jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  useCloudProviders: () => ({
    data: [
      {
        short_name: 'AWS',
        regions: [{ city: 'Paris', name: 'eu-west-3', country_code: 'FR' }],
      },
      {
        short_name: 'GCP',
        regions: [{ city: 'Paris', name: 'europe-west9', country_code: 'FR' }],
      },
    ],
  }),
}))

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
  cluster: {
    cloud_provider: 'AWS',
    infrastructure_outputs: {
      kind: 'EKS',
      cluster_name: 'my-cluster',
      cluster_arn: 'arn:aws:eks:eu-west-3:123456789012:cluster/my-cluster',
      cluster_oidc_issuer: 'https://oidc.eks.eu-west-3.amazonaws.com/id/1234567890',
      vpc_id: 'vpc-1234567890',
    },
  } as SecretManagerIntegrationModalProps['cluster'],
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
    await selectEvent.select(screen.getByLabelText('Region'), 'Paris (eu-west-3)', { container: document.body })
    await userEvent.click(screen.getByRole('button', { name: 'Add secret manager' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Prod secrets',
        authentication: { mode: 'AUTOMATICALLY_CONFIGURED' },
      })
    )
  })

  it('should require AWS static credential fields before submitting', async () => {
    jest.mocked(hasAwsAutomaticIntegrationConfigured).mockReturnValue(true)

    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(<SecretManagerIntegrationModal {...defaultProps} onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Add secret manager' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Please enter a secret manager name.')).toBeInTheDocument()
    expect(await screen.findByText('Please select a region.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your access key.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your secret access key.')).toBeInTheDocument()
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

  it('should disable assume role when the cluster has not been successfully deployed yet', async () => {
    const { userEvent } = renderWithProviders(
      <SecretManagerIntegrationModal
        {...defaultProps}
        cluster={{ cloud_provider: 'AWS' } as SecretManagerIntegrationModalProps['cluster']}
      />
    )

    await userEvent.click(screen.getByText('Manual integration'))

    expect(screen.getByLabelText('Authentication type')).toBeEnabled()
    expect(screen.queryByText('Select an authentication type to see the required information.')).not.toBeInTheDocument()

    selectEvent.openMenu(screen.getByLabelText('Authentication type'))

    const assumeRoleOption = screen.getByText('Assume role via STS')
    await userEvent.hover(assumeRoleOption)

    expect(
      await screen.findByRole('tooltip', {
        name: 'The cluster must be successfully deployed before setting up a Secret Manager with Assume role via STS.',
      })
    ).toBeInTheDocument()
  })

  it('should require AWS assume role fields before submitting', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(<SecretManagerIntegrationModal {...defaultProps} onSubmit={onSubmit} />)

    await userEvent.click(screen.getByText('Manual integration'))
    await selectEvent.select(screen.getByLabelText('Authentication type'), 'Assume role via STS', {
      container: document.body,
    })
    await userEvent.click(screen.getByRole('button', { name: 'Add secret manager' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Please enter a secret manager name.')).toBeInTheDocument()
    expect(await screen.findByText('Please select a region.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your role ARN.')).toBeInTheDocument()
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

  it('should require GCP automatic project and region before submitting', async () => {
    const onSubmit = jest.fn()
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
      } as SecretManagerIntegrationModalProps['cluster'],
      onSubmit,
    }

    const { userEvent } = renderWithProviders(<SecretManagerIntegrationModal {...gcpProps} />)

    await userEvent.click(screen.getByRole('button', { name: 'Add secret manager' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Please enter a secret manager name.')).toBeInTheDocument()
    expect(await screen.findByText('Please enter your GCP Project ID.')).toBeInTheDocument()
    expect(screen.getByText('Please select a region.')).toBeInTheDocument()
  })
})
