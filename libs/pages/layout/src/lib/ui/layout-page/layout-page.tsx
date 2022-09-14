import { SignUp } from 'qovery-typescript-axios'
import { WarningScreenMobile } from '@qovery/shared/ui'
import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  children?: React.ReactElement
  user: SignUp
  darkMode?: boolean
  topBar?: boolean
}

export function LayoutPage(props: LayoutPageProps) {
  const { children, user, darkMode, topBar = true } = props

  return (
    <>
      <WarningScreenMobile />
      <main className={`${darkMode ? 'bg-element-light-darker-600 h-screen' : 'bg-element-light-lighter-400'}`}>
        <Navigation darkMode={darkMode} firstName={user?.first_name} lastName={user?.last_name} />
        {topBar && <TopBar darkMode={darkMode} />}
        <div
          className={`${topBar ? 'top-navbar-height' : ''} relative ml-16 h-page-container flex flex-col ${
            !darkMode ? 'pt-2 px-2' : ''
          }`}
        >
          {children}
        </div>
      </main>
    </>
  )
}

export default LayoutPage
