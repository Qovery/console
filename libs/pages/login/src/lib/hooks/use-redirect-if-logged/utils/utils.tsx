export function getRedirectLoginUriFromStorage(): string | null {
  return localStorage.getItem('redirectLoginUri')
}

export function getCurrentOrganizationIdFromStorage(): string | null {
  return localStorage.getItem('currentOrganizationId')
}

export function getCurrentProjectIdFromStorage(): string | null {
  return localStorage.getItem('currentProjectId')
}

export function getCurrentProvider(): string | null {
  return localStorage.getItem('currentProvider')
}
