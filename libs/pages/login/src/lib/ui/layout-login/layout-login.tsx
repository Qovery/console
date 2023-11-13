import { type PropsWithChildren } from 'react'
import { Navbar } from '@qovery/shared/ui'

export function LayoutLogin(props: PropsWithChildren) {
  const { children } = props

  return (
    <main className="h-screen overflow-hidden bg-white flex flex-col-reverse">
      <div className="pt-16 h-full relative">{children}</div>
      <Navbar className="absolute top-0 w-full" />
    </main>
  )
}

export default LayoutLogin
