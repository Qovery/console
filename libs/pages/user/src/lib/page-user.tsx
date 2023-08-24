import { Navigate, Route, Routes } from 'react-router-dom'
import { useUserAccount } from '@qovery/shared/iam/feature'
import { USER_GENERAL_URL, USER_URL } from '@qovery/shared/routes'
import { IconAwesomeEnum } from '@qovery/shared/ui'
import { ROUTER_USER } from './router/router'
import { Container } from './ui/container/container'

export function PageUser() {
  const userLinks = [
    {
      title: 'General',
      icon: IconAwesomeEnum.WHEEL,
      url: USER_URL + USER_GENERAL_URL,
    },
  ]

  const { isFetched } = useUserAccount()

  // Return null if user informations has not been loaded
  if (!isFetched) return null

  return (
    <Container userLinks={userLinks}>
      <Routes>
        {ROUTER_USER.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={USER_URL + USER_GENERAL_URL} />} />
      </Routes>
    </Container>
  )
}

export default PageUser
