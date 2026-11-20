/**
 * q-core lets only MANAGE_ORGANIZATION_DATA write presets, read their history or read usage, and only
 * the Owner and Admin default roles have it (custom roles never do). Same check as the other
 * owner and admin settings: the organization roles in the user's token, or Qovery staff.
 */
export function canManageSkillPresets({
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
    roles.some(
      (role) => role === `organization:${organizationId}:admin` || role === `organization:${organizationId}:owner`
    )
  )
}
