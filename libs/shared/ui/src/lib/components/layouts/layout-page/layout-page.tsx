import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  children: React.ReactElement
}

export function LayoutPage(props: LayoutPageProps) {
  const { children } = props

  return (
    <main className="h-screen bg-element-light-lighter-400">
      <div className="p-2 mt-14 ml-14">{children}</div>
      <Navigation />
      <TopBar />
    </main>
  )
}

export default LayoutPage
