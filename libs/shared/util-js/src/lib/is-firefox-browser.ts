export function isFirefoxBrowser(userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent): boolean {
  const normalizedUserAgent = userAgent.toLowerCase()

  return normalizedUserAgent.includes('firefox/') && !/(chrome|chromium|crios|edg|safari|dia)/.test(normalizedUserAgent)
}
