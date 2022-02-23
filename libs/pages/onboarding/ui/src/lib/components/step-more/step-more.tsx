import { InputTextArea } from '@console/shared-ui'

export function StepMore() {
  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">Tell us more</h1>
      <p className="text-sm mb-10 text-text-500">
        Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim
        velit mollit. Exercitation veniam consequat sunt nostrud amet.
      </p>
      <form>
        <InputTextArea className="mb-3" name="why" label="Why do you want to use Qovery?" />
        <InputTextArea className="mb-3" name="recommendations" label="Any questions or recommendations?" />
        {/* <Link to={`${ONBOARDING_URL}${ONBOARDING_COMPANY_URL}`}>Continue</Link> */}
      </form>
    </div>
  )
}

export default StepMore
