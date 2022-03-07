import { ONBOARDING_PROJECT_URL, Route } from '@console/shared/utils'
import { Navbar } from '@console/shared/ui'
import { BenefitsCard } from '../benefits-card/benefits-card'

interface LayoutOnboardingProps {
  children: React.ReactElement
  currentStepPosition: number
  stepsNumber: number
  getProgressPercentValue: number
  step: string | undefined
  routes: Route[]
}

export function LayoutOnboarding(props: LayoutOnboardingProps) {
  const { children, currentStepPosition, stepsNumber, getProgressPercentValue, step } = props

  return (
    <main className="h-screen">
      <Navbar
        className="absolute top-0 w-full"
        progress={getProgressPercentValue}
        contentLeft={
          <div className="flex items-center ml-6">
            <div className="bg-element-light-lighter-400 text-text-400 text-xs rounded-sm font-bold py-0.5 px-1">
              {currentStepPosition}/{stepsNumber}
            </div>
            <p className="text-text-600 text-sm font-medium ml-4">
              Just a few questions <span className="ml-4 text-text-400">13 minutes left</span>
            </p>
          </div>
        }
      />
      <div className="flex h-full">
        <div className="flex-[1_1_0%] px-24">
          <div className="max-w-lg mt-36 mx-auto">{children}</div>
        </div>
        <div className="flex-[1_1_0%] bg-element-light-lighter-300 overflow-hidden max-w-2xl">
          <div className="relative mt-32">
            {step === ONBOARDING_PROJECT_URL.replace('/', '') ? (
              <BenefitsCard />
            ) : (
              <img
                className="absolute top-[70px] right-[-100px] min-w-[80%] overflow-hidden pointer-events-none select-none"
                src="/assets/onboarding.png"
                alt="Qovery onboarding screen"
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default LayoutOnboarding
