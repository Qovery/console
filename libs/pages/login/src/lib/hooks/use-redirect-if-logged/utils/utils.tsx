export function getRedirectLoginUri(): string | null {
  return localStorage.getItem('redirectLoginUri')
}
