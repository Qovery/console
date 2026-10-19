import { Link, useLocation } from '@tanstack/react-router'
import { PlanEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren, type ReactNode, createContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { FunnelFlow, FunnelFlowBody } from '@qovery/shared/ui'
import qoveryLogotype from './assets/qovery-logotype.svg'

interface DefaultContextProps {
  organization_name: string
  project_name: string
  admin_email: string
  selectedPlan: PlanEnum
  phone?: string
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
  selectedPlan: PlanEnum.BUSINESS_2025,
  phone: undefined,
  cardToken: null,
  cardLast4: null,
  cardExpiryMonth: null,
  cardExpiryYear: null,
}

export const ContextOnboarding = createContext<DefaultContextProps>(defaultContext)

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [contextValue, setContextValue] = useState(defaultContext)

  return (
    <ContextOnboarding.Provider
      value={{
        ...contextValue,
        setContextValue: (data) => setContextValue((previous) => ({ ...previous, ...data })),
      }}
    >
      {children}
    </ContextOnboarding.Provider>
  )
}

export interface ContainerProps extends PropsWithChildren {
  profileUserMenu?: ReactNode
}

export function Container({ children, profileUserMenu }: ContainerProps) {
  const location = useLocation()
  const step = location.pathname.split('/').pop()

  const currentStepPosition = (routes: { path: string; title: string }[]) =>
    routes.findIndex((route) => route.path === currentPath) + 1

  const currentPath = `/${step?.split('/')[0] ?? ''}`
  const titlesPerRoute = [
    {
      path: '/profile',
      title: 'To tailor your experience',
    },
    {
      path: '/use-cases',
      title: 'What are you looking to do?',
    },
    {
      path: '/project',
      title: 'Organization and Project Creation',
    },
  ]
  const currentTitle = titlesPerRoute.find((route) => route.path === currentPath)?.title ?? 'Onboarding'
  const totalSteps = 3
  const currentStep = currentStepPosition(titlesPerRoute)

  if (profileUserMenu) {
    return createPortal(
      <div className="fixed inset-0 z-10 flex flex-col overflow-y-auto bg-background-secondary">
        <header className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 sm:px-8">
          <Link
            to="/"
            aria-label="Qovery home"
            className="focus-visible:ring-brand rounded focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-background-secondary"
          >
            <img src={qoveryLogotype} alt="Qovery" className="dark:brightness-0 dark:invert" />
          </Link>
          {profileUserMenu}
        </header>
        <main className="flex min-h-full shrink-0 flex-col items-center justify-center px-4 py-20">{children}</main>
      </div>,
      document.body
    )
  }

  return (
    <FunnelFlow totalSteps={totalSteps} currentStep={currentStep} currentTitle={currentTitle} portal>
      <FunnelFlowBody customContentWidth="w-full">{children}</FunnelFlowBody>
    </FunnelFlow>
  )
}

export default Container
