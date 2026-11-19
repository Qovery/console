import { BillingError, createPricingClient } from './client'

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'status text',
    json: async () => body,
  }) as Response

const awsMarketplace = { billing_channel: 'chargebee', request: null, offer: null }

describe('createPricingClient', () => {
  const fetchMock = jest.fn()
  const client = createPricingClient({
    pricingApiUrl: 'https://billing-api.example.com/',
    getToken: () => 'token',
    fetch: fetchMock,
  })

  beforeEach(() => fetchMock.mockReset())

  it('reads the AWS Marketplace status with the user token', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, awsMarketplace))

    await expect(client.awsMarketplace('org-1')).resolves.toEqual(awsMarketplace)
    expect(fetchMock).toHaveBeenCalledWith('https://billing-api.example.com/organization/org-1/awsMarketplace', {
      headers: { Authorization: 'Bearer token' },
    })
  })

  it('posts an offer request as JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, awsMarketplace))

    await client.requestAwsMarketplaceOffer('org-1', { aws_account_id: '123456789012', message: 'Hi' })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://billing-api.example.com/organization/org-1/awsMarketplace/offerRequest',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
        body: JSON.stringify({ aws_account_id: '123456789012', message: 'Hi' }),
      }
    )
  })

  it('throws a BillingError with the problem code', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, { code: 'ALREADY_ON_AWS_MARKETPLACE', detail: 'this organization already pays through AWS' })
    )

    const error = await client.requestAwsMarketplaceOffer('org-1', { aws_account_id: '123456789012' }).catch((e) => e)

    expect(error).toBeInstanceOf(BillingError)
    expect(error).toMatchObject({
      status: 409,
      code: 'ALREADY_ON_AWS_MARKETPLACE',
      message: 'this organization already pays through AWS',
    })
  })

  it('keeps the billing usage call unchanged', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}))

    await client.billingUsage('org-1')

    expect(fetchMock).toHaveBeenCalledWith('https://billing-api.example.com/organization/org-1/billingUsage', {
      headers: { Authorization: 'Bearer token' },
    })
  })
})
