import { InputText, Button, ButtonSize, ButtonType } from '@console/shared/ui'
import { ONBOARDING_PRICING_URL, ONBOARDING_URL } from '@console/shared/utils'

export function StepProject() {
  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">
        Create your first project
        <span className="ml-2" role="img" aria-label="star">
          ✨
        </span>
      </h1>
      <p className="text-sm mb-10 text-text-500">
        Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim
        velit mollit.
      </p>
      <form>
        <InputText className="mb-3" name="organization" label="Organization name" />
        <InputText name="project" label="Project name" />
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            link={`${ONBOARDING_URL}${ONBOARDING_PRICING_URL}`}
            size={ButtonSize.BIG}
            type={ButtonType.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          <Button size={ButtonSize.BIG} type={ButtonType.BASIC}>
            Let’s go
            <span className="ml-1" role="img" aria-label="star">
              💫
            </span>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepProject
