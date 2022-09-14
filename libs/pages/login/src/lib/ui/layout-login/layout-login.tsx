import { Navbar } from '@qovery/shared/ui'

interface LayoutLoginProps {
  children: React.ReactElement
}

export function LayoutLogin(props: LayoutLoginProps) {
  const { children } = props

  return (
    <main className="h-screen overflow-hidden bg-white">
      <Navbar className="absolute top-0 w-full z-10" />
      <div className="pt-16 h-full relative">{children}</div>
    </main>
  )
}

export default LayoutLogin
