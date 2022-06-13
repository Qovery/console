import { Navbar } from '@console/shared/ui'
import { useEffect } from 'react'

interface LayoutLoginProps {
  children: React.ReactElement
}

export function LayoutLogin(props: LayoutLoginProps) {
  const { children } = props

  useEffect(() => {
    document.body.classList.add('bg-white')
    return () => {
      document.body.classList.remove('bg-white')
    }
  }, [])

  return (
    <main className="h-screen overflow-hidden">
      <Navbar className="absolute top-0 w-full" />
      <div className="pt-16 h-full relative">{children}</div>
    </main>
  )
}

export default LayoutLogin
