import { type PropsWithChildren, createContext, useEffect, useState } from 'react'
import { type Params, useNavigate } from 'react-router-dom'
import { PlanEnum } from 'qovery-typescript-axios'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import { type Route } from '@qovery/shared/routes'
import { FunnelFlow, FunnelFlowBody } from '@qovery/shared/ui'
import { ROUTER_ONBOARDING } from '../../router/router'
import OnboardingRightContent from '../../ui/onboarding-right-content/onboarding-right-content'

interface DefaultContextProps {
  organization_name: string
  project_name: string
  admin_email: string
  selectedPlan: PlanEnum
  setContextValue?: (data: Partial<Omit<DefaultContextProps, 'setContextValue'>>) => void
}

const defaultContext: DefaultContextProps = {
  organization_name: '',
  project_name: '',
  admin_email: '',
  selectedPlan: PlanEnum.USER_2025,
}

export const ContextOnboarding = createContext<DefaultContextProps>(defaultContext)

export interface ContainerProps {
  params: Readonly<Params<string>>
}

export function Container(props: PropsWithChildren<ContainerProps>) {
  const { children, params } = props

  const navigate = useNavigate()
  const [step, setStep] = useState(params['*'])
  const [contextValue, setContextValue] = useState(defaultContext)

  useEffect(() => {
    setStep(params['*'])
  }, [params, setStep, step, navigate])

  const currentStepPosition = (routes: Route[]) =>
    routes.findIndex((route: Route) => route.path.replace('/:plan', '') === `/${step?.split('/')[0]}`) + 1

  const currentPath = `/${step?.split('/')[0] ?? ''}`
  const titlesPerRoute = ['Just a few questions', 'Free trial activation', 'Organization and Project Creation']
  const currentRouteIndex = ROUTER_ONBOARDING.findIndex((route) => route.path === currentPath)
  const currentTitle = titlesPerRoute[currentRouteIndex] ?? 'Onboarding'
  const projectRoutePath = ROUTER_ONBOARDING[2]?.path
  const stepProject = currentPath === projectRoutePath
  const shouldUseFullWidth = currentRouteIndex === 1

  return (
    <ContextOnboarding.Provider
      value={{
        ...contextValue,
        setContextValue: (data) => setContextValue((previous) => ({ ...previous, ...data })),
      }}
    >
      <FunnelFlow
        totalSteps={ROUTER_ONBOARDING.length}
        currentStep={currentStepPosition(ROUTER_ONBOARDING)}
        currentTitle={currentTitle}
        portal
      >
        <FunnelFlowBody
          helpSectionClassName="!p-0 !bg-transparent !border-transparent"
          helpSection={stepProject && <OnboardingRightContent step={step} />}
          customContentWidth={shouldUseFullWidth ? 'w-full' : undefined}
        >
          {children}
        </FunnelFlowBody>
        <AssistantTrigger />
      </FunnelFlow>
    </ContextOnboarding.Provider>
  )
}

export default Container
