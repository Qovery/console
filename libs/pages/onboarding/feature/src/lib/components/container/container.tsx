import { useEffect, useState, createContext } from 'react'
import { useNavigate, Params } from 'react-router'
import { ONBOARDING_PRICING_FREE_URL, ONBOARDING_PRICING_URL, ONBOARDING_URL, Route } from '@console/shared/utils'
import { LayoutOnboarding } from '@console/pages/onboarding/ui'
import { ROUTER_ONBOARDING_STEP_1, ROUTER_ONBOARDING_STEP_2 } from '../../router/router'

interface DefaultContextProps {
  organization_name: string
  project_name: string
  setContextValue?: (data: { organization_name: string; project_name: string }) => void
}

const defaultContext = {
  organization_name: '',
  project_name: '',
}

export const ContextOnboarding = createContext<DefaultContextProps>(defaultContext)

interface ContainerProps {
  children: React.ReactElement
  params: Readonly<Params<string>>
  firstStep: boolean
}

export function Container(props: ContainerProps) {
  const { children, params, firstStep } = props

  const navigate = useNavigate()
  const [step, setStep] = useState(params['*'])
  const [contextValue, setContextValue] = useState(defaultContext)

  const currentRoutes = firstStep ? ROUTER_ONBOARDING_STEP_1 : ROUTER_ONBOARDING_STEP_2

  useEffect(() => {
    setStep(params['*'])

    if (step === ONBOARDING_PRICING_URL.replace('/', '')) {
      navigate(`${ONBOARDING_URL}${ONBOARDING_PRICING_FREE_URL}`)
    }
  }, [params, setStep, step, navigate])

  const stepsNumber: number = firstStep ? ROUTER_ONBOARDING_STEP_1.length : ROUTER_ONBOARDING_STEP_2.length

  const currentStepPosition = (routes: Route[]) =>
    routes.findIndex((route: Route) => route.path.replace('/:plan', '') === `/${step?.split('/')[0]}`) + 1

  function getProgressPercentValue(): number {
    return (100 * currentStepPosition(currentRoutes)) / stepsNumber
  }

  return (
    <ContextOnboarding.Provider
      value={{
        ...contextValue,
        setContextValue,
      }}
    >
      <LayoutOnboarding
        getProgressPercentValue={getProgressPercentValue()}
        routes={ROUTER_ONBOARDING_STEP_2}
        stepsNumber={stepsNumber}
        currentStepPosition={currentStepPosition(currentRoutes)}
        step={step}
      >
        {children}
      </LayoutOnboarding>
    </ContextOnboarding.Provider>
  )
}

export default Container
