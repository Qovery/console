import { Button, ButtonSize, ButtonType, InputTextArea } from '@console/shared/ui'
import { ONBOARDING_COMPANY_URL, ONBOARDING_PRICING_URL, ONBOARDING_URL } from '@console/shared/utils'

export function StepMore() {
  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">Tell us more</h1>
      <p className="text-sm mb-10 text-text-500">We need some information to proceed with your account creation.</p>
      <form>
        <InputTextArea className="mb-3" name="why" label="Why do you want to use Qovery?" />
        <InputTextArea className="mb-3" name="recommendations" label="Any questions or recommendations?" />
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            link={`${ONBOARDING_URL}${ONBOARDING_COMPANY_URL}`}
            size={ButtonSize.BIG}
            type={ButtonType.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          <Button size={ButtonSize.BIG} type={ButtonType.BASIC} link={`${ONBOARDING_URL}${ONBOARDING_PRICING_URL}`}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepMore
