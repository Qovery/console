import { isTrustedAwsMarketplaceOfferUrl, isValidAwsAccountId } from './aws-marketplace'

describe('isValidAwsAccountId', () => {
  it('accepts 12 digits', () => {
    expect(isValidAwsAccountId('123456789012')).toBe(true)
    expect(isValidAwsAccountId('000000000000')).toBe(true)
  })

  it.each(['', '12345678901', '1234567890123', '12345678901a', '1234-5678-9012', ' 123456789012', '١٢٣٤٥٦٧٨٩٠١٢'])(
    'rejects %p',
    (value) => {
      expect(isValidAwsAccountId(value)).toBe(false)
    }
  )
})

describe('isTrustedAwsMarketplaceOfferUrl', () => {
  it.each([
    'https://aws.amazon.com/marketplace/pp/prodview-abc123',
    'https://console.aws.amazon.com/marketplace/home#/offers/offer-123',
    'https://us-east-1.console.aws.amazon.com/marketplace/home?region=us-east-1#/offers',
    'https://AWS.amazon.com/Marketplace/pp/prodview-abc',
  ])('accepts %s', (url) => {
    expect(isTrustedAwsMarketplaceOfferUrl(url)).toBe(true)
  })

  it.each([
    ['plain http', 'http://aws.amazon.com/marketplace/pp/x'],
    ['javascript url', 'javascript:alert(1)//aws.amazon.com/marketplace'],
    ['data url', 'data:text/html,marketplace'],
    ['opaque https', 'https:aws.amazon.com/marketplace'],
    ['protocol relative', '//aws.amazon.com/marketplace'],
    ['evil host', 'https://evil.com/marketplace'],
    ['lookalike suffix', 'https://aws.amazon.com.evil.com/marketplace'],
    ['lookalike prefix', 'https://evilaws.amazon.com/marketplace'],
    ['other amazon subdomain', 'https://s3.amazonaws.com/marketplace'],
    ['subdomain of aws.amazon.com', 'https://evil.aws.amazon.com/marketplace'],
    ['console lookalike', 'https://console.aws.amazon.com.evil.com/marketplace'],
    ['userinfo', 'https://aws.amazon.com@evil.com/marketplace'],
    ['userinfo on a trusted host', 'https://user:pass@aws.amazon.com/marketplace'],
    ['explicit port', 'https://aws.amazon.com:8443/marketplace'],
    ['default port', 'https://aws.amazon.com:443/marketplace'],
    ['backslash', 'https://evil.com\\@aws.amazon.com/marketplace'],
    ['whitespace', 'https://aws.amazon.com/market place'],
    ['newline', 'https://aws.amazon.com/marketplace\n'],
    ['encoded host', 'https://aws.amazon.com%2eevil.com/marketplace'],
    ['marketplace only in the query', 'https://aws.amazon.com/pp?x=marketplace'],
    ['marketplace only in the fragment', 'https://aws.amazon.com/#marketplace'],
    ['empty', ''],
    ['too long', `https://aws.amazon.com/marketplace/${'a'.repeat(2048)}`],
  ])('rejects %s', (_, url) => {
    expect(isTrustedAwsMarketplaceOfferUrl(url)).toBe(false)
  })

  it('rejects non strings', () => {
    expect(isTrustedAwsMarketplaceOfferUrl(undefined)).toBe(false)
    expect(isTrustedAwsMarketplaceOfferUrl(null)).toBe(false)
  })
})
