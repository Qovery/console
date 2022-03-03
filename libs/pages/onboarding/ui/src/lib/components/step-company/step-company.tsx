import { Button, ButtonSize, ButtonType, InputSelect, InputText, Value } from '@console/shared/ui'
import { ONBOARDING_MORE_URL, ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL } from '@console/shared/utils'

interface StepCompanyProps {
  dataSize: Array<Value>
  dataRole: Array<Value>
}

export function StepCompany(props: StepCompanyProps) {
  const { dataSize, dataRole } = props

  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">About your company</h1>
      <p className="text-sm mb-10 text-text-500">
        Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim
        velit mollit.
      </p>
      <form>
        <InputText className="mb-3" name="company" label="Company" />
        <InputSelect className="mb-3" name="companySize" label="Company size" items={dataSize} />
        <InputSelect className="mb-3" name="role" label="Role" items={dataRole} />
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            link={`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`}
            size={ButtonSize.BIG}
            type={ButtonType.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          <Button size={ButtonSize.BIG} type={ButtonType.BASIC} link={`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepCompany
