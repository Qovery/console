import { SignUp } from 'qovery-typescript-axios'
import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  children: React.ReactElement
  authLogout: () => void
  user: SignUp
}

export function LayoutPage(props: LayoutPageProps) {
  const { children, authLogout, user } = props

  return (
    <main className="h-screen bg-element-light-lighter-400">
      <Navigation authLogout={authLogout} firstName={user.first_name} lastName={user.last_name} />
      <div className="p-2 mt-14 ml-14">{children}</div>
      <TopBar />
    </main>
  )
}

export default LayoutPage
