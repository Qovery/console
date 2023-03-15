import { PlanEnum } from 'qovery-typescript-axios'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface CheckoutUpgradeModalProps {
  plan: PlanEnum
  memberCount: number
}

export function CheckoutUpgradeModal(props: CheckoutUpgradeModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-2 max-w-lg">
        Confirm your change to the {upperCaseFirstLetter(props.plan)} plan for $49 per user
      </h2>
      <p>You have {props.memberCount} users</p>
    </div>
  )
}

export default CheckoutUpgradeModal
