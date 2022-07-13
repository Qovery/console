export function setCurrentOrganizationIdOnStorage(organizationId: string) {
  localStorage.setItem('currentOrganizationId', organizationId)
}

export function setCurrentProjectIdOnStorage(projectId: string) {
  localStorage.setItem('currentProjectId', projectId)
}
