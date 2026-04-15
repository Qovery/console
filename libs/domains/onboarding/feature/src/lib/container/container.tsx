import { useLocation } from '@tanstack/react-router'
import { PlanEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useEffect, useState } from 'react'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import { FunnelFlow, FunnelFlowBody } from '@qovery/shared/ui'

interface DefaultContextProps {
  organization_name: string
  project_name: string
  admin_email: string
  selectedPlan: PlanEnum
  cardToken?: string | null
  cardLast4?: string | null
  cardExpiryMonth?: number | null
  cardExpiryYear?: number | null
  setContextValue?: (data: Partial<Omit<DefaultContextProps, 'setContextValue'>>) => void
}

const defaultContext: DefaultContextProps = {
  organization_name: '',
  project_name: '',
  admin_email: '',
  selectedPlan: PlanEnum.USER_2025,
  cardToken: null,
  cardLast4: null,
  cardExpiryMonth: null,
  cardExpiryYear: null,
}

export const ContextOnboarding = createContext<DefaultContextProps>(defaultContext)

export function Container(props: PropsWithChildren) {
  const { children } = props
  const location = useLocation()
  const [step, setStep] = useState(location.pathname.split('/').pop())
  const [contextValue, setContextValue] = useState(defaultContext)

  useEffect(() => {
    setStep(location.pathname.split('/').pop())
  }, [location.pathname, setStep, step])

  const currentStepPosition = (routes: { path: string; title: string }[]) =>
    routes.findIndex((route) => route.path === currentPath) + 1

  const currentPath = `/${step?.split('/')[0] ?? ''}`
  const titlesPerRoute = [
    {
      path: '/personalize',
      title: 'Just a few questions',
    },
    {
      path: '/project',
      title: 'Organization and Project Creation',
    },
  ]
  const currentTitle = titlesPerRoute.find((route) => route.path === currentPath)?.title ?? 'Onboarding'
  const totalSteps = 2
  const currentStep = currentStepPosition(titlesPerRoute)

  return (
    <ContextOnboarding.Provider
      value={{
        ...contextValue,
        setContextValue: (data) => setContextValue((previous) => ({ ...previous, ...data })),
      }}
    >
      <FunnelFlow totalSteps={totalSteps} currentStep={currentStep} currentTitle={currentTitle} portal>
        <FunnelFlowBody customContentWidth="w-full">{children}</FunnelFlowBody>
        <AssistantTrigger />
      </FunnelFlow>
    </ContextOnboarding.Provider>
  )
}

export default Container
