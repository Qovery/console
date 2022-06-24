import { Route, Routes } from 'react-router-dom'
import { ROUTER_LOGIN } from './router/router'

export function PageLogin() {
  return (
    <Routes>
      {ROUTER_LOGIN.map((route) => (
        <Route key={route.path} path={route.path} element={route.component} />
      ))}
    </Routes>
  )
}

export default PageLogin
