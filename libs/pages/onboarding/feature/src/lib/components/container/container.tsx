import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Route } from '@console/shared/utils'
import { LayoutOnboarding } from '@console/pages/onboarding/ui'
import { ROUTER_ONBOARDING } from '../../router/router'

interface ContainerProps {
  children: React.ReactElement
}

export function Container(props: ContainerProps) {
  const { children } = props

  const params = useParams()
  const [step, setStep] = useState(params['*'])

  useEffect(() => {
    setStep(params['*'])
  }, [params, setStep])

  const stepsNumber: number = ROUTER_ONBOARDING.length
  const currentStepPosition: number = ROUTER_ONBOARDING.findIndex((route: Route) => route.path === `/${step}`) + 1

  function getProgressPercentValue(): number {
    return (100 * currentStepPosition) / stepsNumber
  }

  return (
    <LayoutOnboarding
      getProgressPercentValue={getProgressPercentValue()}
      routes={ROUTER_ONBOARDING}
      stepsNumber={stepsNumber}
      currentStepPosition={currentStepPosition}
      step={step}
    >
      {children}
    </LayoutOnboarding>
  )
}

export default Container
