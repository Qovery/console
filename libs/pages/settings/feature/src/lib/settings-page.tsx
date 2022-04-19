import { useEffect } from 'react'
import { useUser } from '@console/domains/user'
import { Container } from '@console/pages/settings/ui'
import { useAuth, useDocumentTitle } from '@console/shared/utils'

export function SettingsPage() {
  useDocumentTitle('Settings - Qovery')
  const { authLogout } = useAuth()
  const { userSignUp, getUserSignUp } = useUser()

  useEffect(() => {
    getUserSignUp()
  }, [getUserSignUp])

  return <Container authLogout={authLogout} user={userSignUp} />
}

export default SettingsPage
