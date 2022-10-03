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
        <div className="flex">
          <div className="h-full sticky top-0 z-10">
            <Navigation darkMode={darkMode} firstName={user?.first_name} lastName={user?.last_name} />
          </div>
          <div className="w-full">
            {topBar && <TopBar darkMode={darkMode} />}
            <div className={`relative flex flex-col min-h-page-container ${!darkMode ? 'pt-2 px-2' : ''}`}>
              {children}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default LayoutPage
