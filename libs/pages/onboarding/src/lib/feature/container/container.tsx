import { createContext, useEffect, useState } from 'react'
import { Params, useNavigate } from 'react-router-dom'
import { ONBOARDING_PRICING_URL, ONBOARDING_PROJECT_URL, Route } from '@qovery/shared/routes'
import { FunnelFlow, FunnelFlowBody } from '@qovery/shared/ui'
import { ROUTER_ONBOARDING_STEP_1, ROUTER_ONBOARDING_STEP_2 } from '../../router/router'
import OnboardingRightContent from '../../ui/onboarding-right-content/onboarding-right-content'

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

export interface ContainerProps {
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
  }, [params, setStep, step, navigate])

  const currentStepPosition = (routes: Route[]) =>
    routes.findIndex((route: Route) => route.path.replace('/:plan', '') === `/${step?.split('/')[0]}`) + 1

  const isNotStepPricing = `/${step}` !== ONBOARDING_PRICING_URL

  return (
    <ContextOnboarding.Provider
      value={{
        ...contextValue,
        setContextValue,
      }}
    >
      <FunnelFlow
        totalSteps={currentRoutes.length}
        currentStep={currentStepPosition(currentRoutes)}
        currentTitle={
          firstStep
            ? 'Just a few questions'
            : `/${step}` === ONBOARDING_PROJECT_URL
            ? 'Organization and Project Creation'
            : 'Select your plan'
        }
        portal
      >
        <FunnelFlowBody
          helpSectionClassName="!p-0 !bg-transparent !border-transparent"
          helpSection={isNotStepPricing && <OnboardingRightContent step={step} />}
          customContentWidth={!isNotStepPricing ? 'max-w-[1096px]' : undefined}
        >
          {children}
        </FunnelFlowBody>
      </FunnelFlow>
    </ContextOnboarding.Provider>
  )
}

export default Container
