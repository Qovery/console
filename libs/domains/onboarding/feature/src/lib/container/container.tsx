import { useLocation, useNavigate } from '@tanstack/react-router'
import { PlanEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useEffect, useState } from 'react'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import { FunnelFlow, FunnelFlowBody } from '@qovery/shared/ui'
import OnboardingRightContent from '../onboarding-right-content/onboarding-right-content'

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
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(location.pathname.split('/').pop())
  const [contextValue, setContextValue] = useState(defaultContext)
  const { data: organizations = [] } = useOrganizations()
  const { data: userSignUp } = useUserSignUp()

  useEffect(() => {
    setStep(location.pathname.split('/').pop())
  }, [location.pathname, setStep, step, navigate])

  const currentStepPosition = (routes: { path: string; title: string }[]) =>
    routes.findIndex((route) => route.path === currentPath) + 1

  const currentPath = `/${step?.split('/')[0] ?? ''}`
  const titlesPerRoute = [
    {
      path: '/personalize',
      title: 'Just a few questions',
    },
    {
      path: '/plans',
      title: 'Free trial activation',
    },
    {
      path: '/project',
      title: 'Organization and Project Creation',
    },
  ]
  const currentTitle = titlesPerRoute.find((route) => route.path === currentPath)?.title ?? 'Onboarding'
  const stepProject = currentPath === '/project'

  const hasDxAuth = Boolean(userSignUp?.dx_auth)
  const hasExistingOrganization = organizations.length > 0
  const totalSteps = hasExistingOrganization || hasDxAuth ? 2 : titlesPerRoute.length

  useEffect(() => {
    if (hasDxAuth && currentPath === '/plans') {
      navigate({ to: `onboarding/project`, state: location.state })
    }
  }, [currentPath, hasDxAuth, navigate, location.state])

  const currentStep = hasExistingOrganization
    ? currentPath === '/project'
      ? 2
      : 1
    : hasDxAuth
      ? currentPath === '/project'
        ? 2
        : 1
      : currentStepPosition(titlesPerRoute)

  return (
    <ContextOnboarding.Provider
      value={{
        ...contextValue,
        setContextValue: (data) => setContextValue((previous) => ({ ...previous, ...data })),
      }}
    >
      <FunnelFlow totalSteps={totalSteps} currentStep={currentStep} currentTitle={currentTitle} portal>
        <FunnelFlowBody
          helpSectionClassName="!p-0 !bg-transparent !border-transparent"
          helpSection={stepProject && <OnboardingRightContent step={step} />}
          customContentWidth="w-full"
        >
          {children}
        </FunnelFlowBody>
        <AssistantTrigger />
      </FunnelFlow>
    </ContextOnboarding.Provider>
  )
}

export default Container
