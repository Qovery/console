import { PlanEnum } from 'qovery-typescript-axios'
import { Button, ButtonStyle, IconAwesomeEnum, Link } from '@qovery/shared/ui'

export interface UpgradePlanModalProps {
  currentPlan?: PlanEnum
  onClose: () => void
}

export function UpgradePlanModal(props: UpgradePlanModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-2 max-w-sm">Change plan</h2>
      <p className="text-text-500 text-sm mb-1">
        Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim
        velit mollit.
      </p>
      <Link
        link="https://qovery.com/pricing"
        className="text-text-500 text-sm"
        external
        iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
        linkLabel="See details plan"
      ></Link>
      <div>{/* todo put here the three radio box in a Controller*/}</div>
      <div className="flex gap-3 justify-end">
        <Button className="btn--no-min-w" style={ButtonStyle.STROKED} onClick={props.onClose}>
          Cancel
        </Button>
        <Button className="btn--no-min-w" dataTestId="submit-button" type="submit">
          Submit
        </Button>
      </div>
    </div>
  )
}

export default UpgradePlanModal
