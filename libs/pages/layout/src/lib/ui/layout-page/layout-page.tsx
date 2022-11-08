import { SignUp } from 'qovery-typescript-axios'
import { WarningScreenMobile } from '@qovery/shared/ui'
import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  children?: React.ReactElement
  user: SignUp
  topBar?: boolean
}

export function LayoutPage(props: LayoutPageProps) {
  const { children, user, topBar = true } = props

  return (
    <>
      <WarningScreenMobile />
      <main className="dark:bg-element-light-darker-600 dark:h-screen bg-element-light-lighter-400">
        <div className="flex">
          <div className="h-full sticky top-0 z-20">
            <Navigation firstName={user?.first_name} lastName={user?.last_name} />
          </div>
          <div className="w-full">
            {topBar && <TopBar />}
            <div className="relative flex flex-col min-h-page-container pt-2 px-2 dark:pt-0 dark:px-0">{children}</div>
          </div>
        </div>
      </main>
    </>
  )
}

export default LayoutPage
