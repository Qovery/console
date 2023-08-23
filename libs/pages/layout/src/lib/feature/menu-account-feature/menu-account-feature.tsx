import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectAllOrganization, selectOrganizationById } from '@qovery/domains/organization'
import { useUserAccount } from '@qovery/domains/user/feature'
import { useAuth } from '@qovery/shared/auth'
import { type OrganizationEntity } from '@qovery/shared/interfaces'
import { type RootState } from '@qovery/state/store'
import MenuAccount from '../../ui/menu-account/menu-account'

export function MenuAccountFeature() {
  const { organizationId = '' } = useParams()

  const { data: user } = useUserAccount()
  const { user: userToken } = useAuth()

  const currentOrganization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )
  const organizations = useSelector(selectAllOrganization)

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
