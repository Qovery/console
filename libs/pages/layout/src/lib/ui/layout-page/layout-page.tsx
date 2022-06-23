import { SignUp } from 'qovery-typescript-axios'
import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  children?: React.ReactElement
  authLogout: () => void
  user: SignUp
  darkMode?: boolean
}

export function LayoutPage(props: LayoutPageProps) {
  const { children, authLogout, user, darkMode } = props

  return (
    <main className={`${darkMode ? 'bg-element-light-darker-600' : 'bg-element-light-lighter-400'}`}>
      <Navigation darkMode={darkMode} authLogout={authLogout} firstName={user?.first_name} lastName={user?.last_name} />
      <TopBar darkMode={darkMode} />
      <div className="pt-2 px-2 mt-navbar-height ml-16 h-page-container flex flex-col">{children}</div>
    </main>
  )
}

export default LayoutPage
