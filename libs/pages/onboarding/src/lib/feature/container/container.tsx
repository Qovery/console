import { PlanEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useEffect, useState } from 'react'
import { type Params, useLocation, useNavigate } from 'react-router-dom'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import { ONBOARDING_PLANS_URL, ONBOARDING_PROJECT_URL, ONBOARDING_URL, type Route } from '@qovery/shared/routes'
import { FunnelFlow, FunnelFlowBody } from '@qovery/shared/ui'
import { ROUTER_ONBOARDING } from '../../router/router'
import OnboardingRightContent from '../../ui/onboarding-right-content/onboarding-right-content'

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

export interface ContainerProps {
  params: Readonly<Params<string>>
}

export function Container(props: PropsWithChildren<ContainerProps>) {
  const { children, params } = props

  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(params['*'])
  const [contextValue, setContextValue] = useState(defaultContext)
  const { data: organizations = [] } = useOrganizations()
  const { data: userSignUp } = useUserSignUp()

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

  const hasDxAuth = Boolean(userSignUp?.dx_auth)
  const hasExistingOrganization = organizations.length > 0
  const totalSteps = hasExistingOrganization || hasDxAuth ? 2 : ROUTER_ONBOARDING.length

  useEffect(() => {
    if (hasDxAuth && currentPath === ONBOARDING_PLANS_URL) {
      navigate(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`, {
        state: location.state,
      })
    }
  }, [currentPath, hasDxAuth, navigate, location.state])

  const currentStep = hasExistingOrganization
    ? currentPath === ONBOARDING_PROJECT_URL
      ? 2
      : 1
    : hasDxAuth
      ? currentPath === ONBOARDING_PROJECT_URL
        ? 2
        : 1
      : currentStepPosition(ROUTER_ONBOARDING)

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
