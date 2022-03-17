import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ONBOARDING_PRICING_FREE_URL, ONBOARDING_PRICING_URL, ONBOARDING_URL, Route } from '@console/shared/utils'
import { LayoutOnboarding } from '@console/pages/onboarding/ui'
import { ROUTER_ONBOARDING_STEP_2 } from '../../router/router'

interface ContainerProps {
  children: React.ReactElement
}

export function Container(props: ContainerProps) {
  const { children } = props

  const params = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(params['*'])

  useEffect(() => {
    setStep(params['*'])

    if (step === ONBOARDING_PRICING_URL.replace('/', '')) {
      navigate(`${ONBOARDING_URL}${ONBOARDING_PRICING_FREE_URL}`)
    }
  }, [params, setStep, step, navigate])

  const stepsNumber: number = ROUTER_ONBOARDING_STEP_2.length
  const currentStepPosition: number =
    ROUTER_ONBOARDING_STEP_2.findIndex(
      (route: Route) => route.path.replace('/:plan', '') === `/${step?.split('/')[0]}`
    ) + 1

  function getProgressPercentValue(): number {
    return (100 * currentStepPosition) / stepsNumber
  }

  return (
    <LayoutOnboarding
      getProgressPercentValue={getProgressPercentValue()}
      routes={ROUTER_ONBOARDING_STEP_2}
      stepsNumber={stepsNumber}
      currentStepPosition={currentStepPosition}
      step={step}
    >
      {children}
    </LayoutOnboarding>
  )
}

export default Container
