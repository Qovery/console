import { type AwsMarketplace, BillingError } from '@qovery/shared/billing-kit'
import * as iamFeature from '@qovery/shared/iam/feature'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { AwsMarketplaceCard, AwsMarketplaceCardContent, normalizeAwsAccountId } from './aws-marketplace-card'

const mockClient = {
  billingUsage: jest.fn(),
  awsMarketplace: jest.fn(),
  requestAwsMarketplaceOffer: jest.fn(),
}
let mockFlagEnabled = true

jest.mock('../../hooks/use-pricing-client/use-pricing-client', () => ({
  usePricingClient: () => mockClient,
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

jest.mock('posthog-js/react', () => ({
  ...jest.requireActual('posthog-js/react'),
  useFeatureFlagEnabled: (flag: string) => flag === 'billing-aws-marketplace' && mockFlagEnabled,
}))

const useUserRoleSpy = jest.spyOn(iamFeature, 'useUserRole')

const notRequested: AwsMarketplace = { billing_channel: 'chargebee', request: null, offer: null }
const openRequest: AwsMarketplace = {
  billing_channel: 'chargebee',
  request: {
    id: '7',
    status: 'open',
    aws_account_id: '123456789012',
    message: 'Annual plan please',
    requested_at: '2026-11-10T09:00:00Z',
    requested_by: 'jane@example.com',
  },
  offer: null,
}
const offerSent = (url: string, expires_at: string | null = '2026-12-31T00:00:00Z'): AwsMarketplace => ({
  ...openRequest,
  request: { ...openRequest.request!, status: 'offer_sent' },
  offer: { url, expires_at, note: 'Growth plan, 12 months' },
})

const renderContent = (awsMarketplace: AwsMarketplace) =>
  renderWithProviders(<AwsMarketplaceCardContent organizationId="org-1" awsMarketplace={awsMarketplace} />)

describe('AwsMarketplaceCardContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('not requested', () => {
    it('explains the offer and shows the request form', () => {
      renderContent(notRequested)

      expect(screen.getByText(/Pay for Qovery through your AWS bill/)).toBeInTheDocument()
      expect(screen.getByLabelText('AWS account ID')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Request a private offer' })).toBeInTheDocument()
    })

    it.each(['12345', '12345678901a', '1234567890123'])('rejects the account id %p', async (value) => {
      const { userEvent } = renderContent(notRequested)

      await userEvent.type(screen.getByLabelText('AWS account ID'), value)
      await userEvent.click(screen.getByRole('button', { name: 'Request a private offer' }))

      expect(await screen.findByText('An AWS account ID has 12 digits, like 123456789012.')).toBeInTheDocument()
      expect(mockClient.requestAwsMarketplaceOffer).not.toHaveBeenCalled()
    })

    it('requires an account id', async () => {
      const { userEvent } = renderContent(notRequested)

      await userEvent.click(screen.getByRole('button', { name: 'Request a private offer' }))

      expect(await screen.findByText('Enter your AWS account ID.')).toBeInTheDocument()
      expect(mockClient.requestAwsMarketplaceOffer).not.toHaveBeenCalled()
    })

    it('sends the account id as digits with the optional message', async () => {
      mockClient.requestAwsMarketplaceOffer.mockResolvedValue(openRequest)
      const { userEvent } = renderContent(notRequested)

      await userEvent.type(screen.getByLabelText('AWS account ID'), '1234-5678-9012')
      await userEvent.type(screen.getByLabelText('Message (optional)'), '  Annual plan please  ')
      await userEvent.click(screen.getByRole('button', { name: 'Request a private offer' }))

      await waitFor(() =>
        expect(mockClient.requestAwsMarketplaceOffer).toHaveBeenCalledWith('org-1', {
          aws_account_id: '123456789012',
          message: 'Annual plan please',
        })
      )
    })

    it('omits an empty message', async () => {
      mockClient.requestAwsMarketplaceOffer.mockResolvedValue(openRequest)
      const { userEvent } = renderContent(notRequested)

      await userEvent.type(screen.getByLabelText('AWS account ID'), '123456789012')
      await userEvent.click(screen.getByRole('button', { name: 'Request a private offer' }))

      await waitFor(() =>
        expect(mockClient.requestAwsMarketplaceOffer).toHaveBeenCalledWith('org-1', { aws_account_id: '123456789012' })
      )
    })

    it.each([
      ['INVALID_AWS_ACCOUNT_ID', 400, 'Enter the 12-digit ID of the AWS account that will accept the offer.'],
      ['ALREADY_ON_AWS_MARKETPLACE', 409, 'This organization already pays through AWS Marketplace.'],
      ['BILLING_ROLE_REQUIRED', 403, 'Only Owners, Admins and Billing Managers can request a private offer.'],
      ['TOO_MANY_REQUESTS', 429, 'Too many requests today. Try again tomorrow, or contact your account manager.'],
    ])('explains a %s error', async (code, status, message) => {
      mockClient.requestAwsMarketplaceOffer.mockRejectedValue(new BillingError(status, code, 'detail'))
      const { userEvent } = renderContent(notRequested)

      await userEvent.type(screen.getByLabelText('AWS account ID'), '123456789012')
      await userEvent.click(screen.getByRole('button', { name: 'Request a private offer' }))

      expect(await screen.findByText(message)).toBeInTheDocument()
    })

    it('shows the form again after a closed request', () => {
      renderContent({ ...openRequest, request: { ...openRequest.request!, status: 'closed' } })
      expect(screen.getByRole('button', { name: 'Request a private offer' })).toBeInTheDocument()
    })
  })

  describe('open', () => {
    it('shows the pending request', () => {
      renderContent(openRequest)

      expect(
        screen.getByText(
          `Request sent on ${dateMediumLocalFormat('2026-11-10T09:00:00Z')} for AWS account 123456789012. We will send your private offer.`
        )
      ).toBeInTheDocument()
    })

    it('lets the user edit the request', async () => {
      mockClient.requestAwsMarketplaceOffer.mockResolvedValue(openRequest)
      const { userEvent } = renderContent(openRequest)

      await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

      expect(screen.getByLabelText('AWS account ID')).toHaveValue('123456789012')
      expect(screen.getByLabelText('Message (optional)')).toHaveValue('Annual plan please')

      await userEvent.click(screen.getByRole('button', { name: 'Update request' }))

      await waitFor(() =>
        expect(mockClient.requestAwsMarketplaceOffer).toHaveBeenCalledWith('org-1', {
          aws_account_id: '123456789012',
          message: 'Annual plan please',
        })
      )
    })
  })

  describe('offer sent', () => {
    it('links to the offer on AWS in a new tab', () => {
      const url = 'https://us-east-1.console.aws.amazon.com/marketplace/home#/offers/offer-abc'
      renderContent(offerSent(url))

      expect(screen.getByText('Your private offer is ready')).toBeInTheDocument()
      expect(screen.getByText(/Accept it before/)).toBeInTheDocument()
      expect(screen.getByText('Growth plan, 12 months')).toBeInTheDocument()
      const link = screen.getByRole('link', { name: /Review and accept in AWS/ })
      expect(link).toHaveAttribute('href', url)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('does not mention an expiry date when there is none', () => {
      renderContent(offerSent('https://aws.amazon.com/marketplace/pp/prodview-abc', null))
      expect(screen.queryByText(/Accept it before/)).not.toBeInTheDocument()
    })

    it.each([
      'https://evil.com/marketplace',
      'https://aws.amazon.com.evil.com/marketplace',
      'https://aws.amazon.com@evil.com/marketplace',
      'http://aws.amazon.com/marketplace',
      'javascript:alert(document.cookie)//aws.amazon.com/marketplace',
      'https://aws.amazon.com/pricing',
    ])('shows Contact us and no link for %s', (url) => {
      renderContent(offerSent(url))

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.getByTestId('aws-marketplace-contact-us')).toHaveTextContent(
        'Contact us to get the link to your offer.'
      )
    })
  })

  describe('accepted', () => {
    it('says the organization pays through AWS Marketplace', () => {
      renderContent({ ...openRequest, request: { ...openRequest.request!, status: 'accepted' } })

      expect(screen.getByText('You pay through AWS Marketplace.')).toBeInTheDocument()
      expect(screen.getByText('Your Qovery invoices come from AWS, on your AWS bill.')).toBeInTheDocument()
    })

    it('also covers organizations set on the AWS Marketplace billing channel', () => {
      renderContent({ billing_channel: 'aws_marketplace', request: null, offer: null })

      expect(screen.getByText('You pay through AWS Marketplace.')).toBeInTheDocument()
      expect(screen.queryByLabelText('AWS account ID')).not.toBeInTheDocument()
    })
  })
})

describe('AwsMarketplaceCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFlagEnabled = true
    useUserRoleSpy.mockReturnValue({ roles: ['organization:org-1:billing'], loading: false, isQoveryAdminUser: false })
    mockClient.awsMarketplace.mockResolvedValue(notRequested)
  })

  it('loads the status for billing roles', async () => {
    renderWithProviders(<AwsMarketplaceCard />)

    expect(await screen.findByText(/Pay for Qovery through your AWS bill/)).toBeInTheDocument()
    expect(mockClient.awsMarketplace).toHaveBeenCalledWith('org-1')
  })

  it('is hidden while the flag is off', () => {
    mockFlagEnabled = false
    renderWithProviders(<AwsMarketplaceCard />)

    expect(screen.queryByTestId('aws-marketplace-card')).not.toBeInTheDocument()
    expect(mockClient.awsMarketplace).not.toHaveBeenCalled()
  })

  it.each([['organization:org-1:devops'], ['organization:org-1:billing-team'], ['organization:org-2:billing']])(
    'is hidden for %s',
    (role) => {
      useUserRoleSpy.mockReturnValue({ roles: [role], loading: false, isQoveryAdminUser: false })
      renderWithProviders(<AwsMarketplaceCard />)

      expect(screen.queryByTestId('aws-marketplace-card')).not.toBeInTheDocument()
      expect(mockClient.awsMarketplace).not.toHaveBeenCalled()
    }
  )

  it('is hidden when the API refuses the user', async () => {
    mockClient.awsMarketplace.mockRejectedValue(new BillingError(403, 'BILLING_ROLE_REQUIRED', 'only billing roles'))
    renderWithProviders(<AwsMarketplaceCard />)

    await waitFor(() => expect(screen.queryByTestId('aws-marketplace-card')).not.toBeInTheDocument())
  })
})

describe('normalizeAwsAccountId', () => {
  it('keeps the digits', () => {
    expect(normalizeAwsAccountId(' 1234-5678 9012 ')).toBe('123456789012')
  })
})
