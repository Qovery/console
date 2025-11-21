import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@qovery/shared/auth'
import { useDeleteOrganization, useOrganization, useOrganizations } from '@qovery/domains/organizations/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useQueryClient } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'
import PageOrganizationDangerZone from '../../ui/page-organization-danger-zone/page-organization-danger-zone'

export function PageOrganizationDangerZoneFeature() {
  const { organizationId = '' } = useParams()
  useDocumentTitle('Danger zone - Organization settings')

  const navigate = useNavigate()
  const { authLogout } = useAuth()
  const queryClient = useQueryClient()

  const { data: organization } = useOrganization({ organizationId })
  const { data: organizations = [] } = useOrganizations()
  const { mutateAsync: deleteOrganization, isLoading: isLoadingDeleteOrganization } = useDeleteOrganization()

  const deleteOrganizationAction = async () => {
    try {
      await deleteOrganization({
        organizationId,
      })
      if (organizations.length === 1) {
        localStorage.removeItem('currentOrganizationId')
        localStorage.removeItem('currentProjectId')
        queryClient.removeQueries({ queryKey: queries.organizations.list.queryKey })
        await authLogout()
      } else {
        queryClient.invalidateQueries({ queryKey: queries.organizations.list.queryKey })
        navigate('/')
      }
   } catch (error) {
     console.error(error)
   }
 }

  return (
    <PageOrganizationDangerZone
      deleteOrganization={deleteOrganizationAction}
      organization={organization}
      loading={isLoadingDeleteOrganization}
    />
  )
}

export default PageOrganizationDangerZoneFeature
