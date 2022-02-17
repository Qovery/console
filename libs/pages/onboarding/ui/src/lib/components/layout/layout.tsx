import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Navbar } from '@console/shared-ui'
import { ROUTER_ONBOARDING } from '../../router/router'

interface LayoutProps {
  children: React.ReactElement
}

export function Layout(props: LayoutProps) {
  const { children } = props

  const params = useParams()
  const [step, setStep] = useState(params['*'])

  useEffect(() => {
    setStep(params['*'])
  }, [params, setStep])

  function getProgressPercentValue(): number {
    const stepsNumber: number = ROUTER_ONBOARDING.length
    const currentStepPosition: number = ROUTER_ONBOARDING.findIndex((route) => route.path === `/${step}`)
    return (100 * currentStepPosition) / stepsNumber
  }

  return (
    <main>
      <Navbar progress={getProgressPercentValue()} />
      {children}
    </main>
  )
}

export default Layout
