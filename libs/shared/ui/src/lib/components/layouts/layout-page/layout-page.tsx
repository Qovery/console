import { Link } from 'react-router-dom'
import { LOGIN_URL, OVERVIEW_URL, useAuth } from '@console/shared/utils'

export interface LayoutPageProps {
  children: React.ReactElement
}

const LayoutPage = (props: LayoutPageProps) => {
  const { authLogout } = useAuth()
  const { children } = props

  return (
    <main className="bg-brand-50 p-20 h-screen">
      <nav>
        <div className="flex mb-10">
          <Link className="mr-4" to={OVERVIEW_URL}>
            Overview
          </Link>
          <Link className="mr-4" to={LOGIN_URL}>
            Login
          </Link>
          <button onClick={() => authLogout()}>Logout</button>
        </div>
      </nav>
      <div>{children}</div>
    </main>
  )
}

export default LayoutPage
