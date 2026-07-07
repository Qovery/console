import { isFirefoxBrowser } from './is-firefox-browser'

describe('isFirefoxBrowser', () => {
  it('returns true for Firefox user agents', () => {
    expect(
      isFirefoxBrowser('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0')
    ).toBe(true)
  })

  it('returns false for Dia user agents', () => {
    expect(
      isFirefoxBrowser(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Dia/1.0 Firefox/140.0 Safari/537.36'
      )
    ).toBe(false)
  })

  it('returns false for Chromium-based user agents', () => {
    expect(
      isFirefoxBrowser(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      )
    ).toBe(false)
  })
})
