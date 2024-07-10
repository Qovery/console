import { useParams } from 'react-router-dom'
import { useOrganization, useOrganizations } from '@qovery/domains/organizations/feature'
import { useAuth } from '@qovery/shared/auth'
import { useUserAccount } from '@qovery/shared/iam/feature'
import MenuAccount from '../../ui/menu-account/menu-account'

export function MenuAccountFeature() {
  const { organizationId = '' } = useParams()

  const { data: user } = useUserAccount()
  const { user: userToken } = useAuth()

  const { data: organizations = [] } = useOrganizations()
  const { data: currentOrganization } = useOrganization({ organizationId, enabled: !!organizationId })

  return (
    <MenuAccount
      organizations={organizations}
      currentOrganization={currentOrganization}
      user={{
        firstName: user?.first_name,
        lastName: user?.last_name,
        email: user?.communication_email ?? userToken?.email,
        picture: user?.profile_picture_url,
      }}
    />
  )
}

export default MenuAccountFeature
