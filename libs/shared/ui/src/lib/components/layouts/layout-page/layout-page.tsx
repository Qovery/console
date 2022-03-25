import { Link } from 'react-router-dom'
import { LOGIN_URL, OVERVIEW_URL, useAuth } from '@console/shared/utils'
import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  children: React.ReactElement
}

export function LayoutPage(props: LayoutPageProps) {
  const { authLogout } = useAuth()
  const { children } = props

  return (
    <main className="h-screen bg-element-light-lighter-400">
      <Navigation></Navigation>
      <TopBar></TopBar>
      <div className='p-2 mt-14 ml-14'>{children}</div>
    </main>
  )
}

export default LayoutPage
