import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { SettingsDangerZone } from '@qovery/domains/organizations/feature'
import { useUserRole } from '@qovery/shared/iam/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/danger-zone')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '' } = useParams({ strict: false })
  const { roles, loading } = useUserRole()

  const isOrganizationAdmin = roles.some((role) => role.includes(`organization:${organizationId}:admin`))

  if (loading) {
    return null
  }

  if (!isOrganizationAdmin) {
    return <Navigate to="/organization/$organizationId/settings/general" params={{ organizationId }} replace />
  }

  return <SettingsDangerZone />
}
