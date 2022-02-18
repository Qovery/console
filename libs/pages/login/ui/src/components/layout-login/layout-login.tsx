import { Navbar } from '@console/shared-ui'

interface LayoutLoginProps {
  children: React.ReactElement
}

export function LayoutLogin(props: LayoutLoginProps) {
  const { children } = props

  return (
    <main className="h-screen">
      <Navbar className="absolute top-0 w-full" />
      <div className="pt-16 h-full">{children}</div>
    </main>
  )
}

export default LayoutLogin
