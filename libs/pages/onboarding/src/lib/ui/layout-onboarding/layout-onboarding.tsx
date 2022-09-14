import { Route } from '@qovery/shared/router'
import { Navbar } from '@qovery/shared/ui'
import OnboardingRightContent from '../onboarding-right-content/onboarding-right-content'

export interface LayoutOnboardingProps {
  children: React.ReactElement
  currentStepPosition: number
  stepsNumber: number
  getProgressPercentValue: number
  step: string | undefined
  catchline: string
  routes: Route[]
}

export function LayoutOnboarding(props: LayoutOnboardingProps) {
  const { children, currentStepPosition, stepsNumber, getProgressPercentValue, step, catchline } = props

  return (
    <main className="layout-onboarding h-full min-h-screen bg-white">
      <Navbar
        className="absolute top-0 w-full z-10"
        progress={getProgressPercentValue}
        contentLeft={
          <div className="flex items-center ml-6">
            <div className="bg-element-light-lighter-400 text-text-400 text-xs rounded-sm font-bold py-0.5 px-1">
              {currentStepPosition}/{stepsNumber}
            </div>
            <p className="text-text-600 text-sm font-medium ml-4">{catchline}</p>
          </div>
        }
      />
      <div className="flex h-full min-h-screen max-w-screen-2xl ml-auto mr-auto relative">
        <div className="flex-[2_1_0%] px-4 md:px-24 bg-white">
          <div className="max-w-lg mt-36 mx-auto">{children}</div>
        </div>
        <div className="hidden xl:block flex-[1_1_0%] pl-20 bg-element-light-lighter-300 overflow-hidden max-w-2xl before:absolute before:top-0 before:w-full before:h-full before:bg-element-light-lighter-300">
          <OnboardingRightContent step={step} />
        </div>
      </div>
    </main>
  )
}

export default LayoutOnboarding
