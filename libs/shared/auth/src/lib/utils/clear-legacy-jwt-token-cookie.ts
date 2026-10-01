/**
 * XXX: Cleanup legacy jwtToken cookie which can cause RequestHeaderSectionTooLarge problems
 * https://qovery.atlassian.net/browse/FRT-1086
 * https://github.com/Qovery/console/pull/1188
 */
export function clearLegacyJwtTokenCookie() {
  if (document.cookie.split(';').some((item) => item.trim().startsWith('jwtToken='))) {
    document.cookie = 'jwtToken=; Max-Age=-99999999; domain=.qovery.com'
  }
}
