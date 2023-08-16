import { Navigate, Route, Routes } from 'react-router-dom'
import { SETTINGS_GENERAL_URL, USER_URL } from '@qovery/shared/routes'
import { IconAwesomeEnum } from '@qovery/shared/ui'
import { ROUTER_SETTINGS } from './router/router'
import { Container } from './ui/container/container'

export function PageUser() {
  const userLinks = [
    {
      title: 'General',
      icon: IconAwesomeEnum.WHEEL,
      url: USER_URL + SETTINGS_GENERAL_URL,
    },
  ]

  return (
    <Container userLinks={userLinks}>
      <Routes>
        {ROUTER_SETTINGS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={USER_URL + SETTINGS_GENERAL_URL} />} />
      </Routes>
    </Container>
  )
}

export default PageUser
