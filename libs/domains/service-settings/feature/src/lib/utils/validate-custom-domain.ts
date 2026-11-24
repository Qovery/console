// Mirrors the API rule for custom domain names (`.{2,}\.[a-z]{2,}$`), with an actionable message per mistake.
const CUSTOM_DOMAIN_PATTERN = /^.{2,}\.[a-z]{2,}$/

export function validateCustomDomain(value: string): true | string {
  if (/^[a-z]+:\/\//i.test(value)) return 'Enter the domain without http:// or https://.'
  if (/[\s/]/.test(value)) return "A domain can't contain spaces or slashes."
  if (/[A-Z]/.test(value)) return 'Use lowercase letters only.'
  if (!CUSTOM_DOMAIN_PATTERN.test(value)) return 'Enter a full domain name, such as app.example.com.'
  return true
}
