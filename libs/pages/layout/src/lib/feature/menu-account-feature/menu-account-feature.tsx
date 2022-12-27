import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectAllOrganization, selectOrganizationById } from '@qovery/domains/organization'
import { selectUser, selectUserSignUp } from '@qovery/domains/user'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { RootState } from '@qovery/store'
import MenuAccount from '../../ui/menu-account/menu-account'

export function MenuAccountFeature() {
  const { organizationId = '' } = useParams()

  const user = useSelector(selectUserSignUp)
  const userToken = useSelector(selectUser)

  const currentOrganization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )
  const organizations = useSelector(selectAllOrganization)

  if (!currentOrganization) return null

  return (
    <MenuAccount
      organizations={organizations}
      currentOrganization={currentOrganization}
      user={{
        firstName: user.first_name || userToken.name,
        lastName: user.last_name,
        email: user.user_email || userToken.email,
        picture: userToken.picture,
      }}
    />
  )
}

export default MenuAccountFeature
