import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  children: React.ReactElement
}

export function LayoutPage(props: LayoutPageProps) {
  const { children } = props

  return (
    <main className="h-screen bg-element-light-lighter-400">
      <Navigation />
      <TopBar />
      <div className="p-2 mt-14 ml-14">{children}</div>
    </main>
  )
}

export default LayoutPage
