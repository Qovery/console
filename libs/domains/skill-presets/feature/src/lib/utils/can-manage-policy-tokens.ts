/**
 * q-core lets MANAGE_OTHER_ORGANIZATION_SETUP list, create and delete policy tokens: the Owner, Admin
 * and DevOps default roles have it, custom roles never do. The same people managed them in the
 * organization settings before.
 */
export function canManagePolicyTokens({
  roles,
  organizationId,
  isQoveryAdminUser,
}: {
  roles: string[]
  organizationId: string
  isQoveryAdminUser: boolean
}) {
  return (
    isQoveryAdminUser ||
    ['owner', 'admin', 'devops'].some((role) => roles.includes(`organization:${organizationId}:${role}`))
  )
}
