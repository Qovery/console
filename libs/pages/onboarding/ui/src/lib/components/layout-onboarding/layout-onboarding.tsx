import { Navbar } from '@console/shared-ui'

interface LayoutOnboardingProps {
  children: React.ReactElement
}

export function LayoutOnboarding(props: LayoutOnboardingProps) {
  const { children } = props

  return (
    <main className="h-screen">
      <Navbar className="absolute top-0 w-full" />
      <div className="pt-16 h-full">{children}</div>
    </main>
  )
}

export default LayoutOnboarding
