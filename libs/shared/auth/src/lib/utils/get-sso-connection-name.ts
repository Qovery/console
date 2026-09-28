/**
 * Auth0 enterprise connections (SAML / OIDC) are named after the company domain without its TLD
 * e.g. `qovery.com` -> `qovery`, `acme.co.uk` -> `acme.co`
 */
export function getSsoConnectionName(domain: string) {
  const trimmed = domain.trim()
  return trimmed.includes('.') ? trimmed.substring(0, trimmed.lastIndexOf('.')) : trimmed
}
