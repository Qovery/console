import { Route } from '@console/shared/utils'
import { Navbar } from '@console/shared/ui'
import OnboardingRightContent from '../onboarding-right-content/onboarding-right-content'

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
    <main className="h-screen overflow-hidden">
      <Navbar
        className="absolute top-0 w-full"
        progress={getProgressPercentValue}
        contentLeft={
          <div className="flex items-center ml-6">
            <div className="bg-element-light-lighter-400 text-text-400 text-xs rounded-sm font-bold py-0.5 px-1">
              {currentStepPosition}/{stepsNumber}
            </div>
            <p className="text-text-600 text-sm font-medium ml-4">Just a few questions</p>
          </div>
        }
      />
      <div className="flex h-full max-w-screen-2xl ml-auto mr-auto relative">
        <div className="flex-[2_1_0%] px-24">
          <div className="max-w-lg mt-36 mx-auto">{children}</div>
        </div>
        <div className="flex-[1_1_0%] pl-20 bg-element-light-lighter-300 overflow-hidden max-w-2xl -z-10 before:absolute before:top-0 before:w-full before:h-full before:bg-element-light-lighter-300">
          <OnboardingRightContent step={step} />
        </div>
      </div>
    </main>
  )
}

export default LayoutOnboarding
