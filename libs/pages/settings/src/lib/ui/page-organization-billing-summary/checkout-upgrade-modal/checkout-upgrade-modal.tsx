import { PlanEnum } from 'qovery-typescript-axios'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface CheckoutUpgradeModalProps {
  plan: PlanEnum
  memberCount: number
}

export function CheckoutUpgradeModal(props: CheckoutUpgradeModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-2 max-w-lg mb-8">
        Confirm your change to the {upperCaseFirstLetter(props.plan)} plan for $49 per user
      </h2>
      <div className="bg-element-light-lighter-200 border border-element-light-lighter-500 rounded px-6 py-5">
        <div className="flex items-center justify-between font-medium text-sm text-text-600 mb-1">
          <span>Total seat</span>
          <span>{props.memberCount}</span>
        </div>
        <p className="text-text-400 text-sm mb-4">
          At the beginning of each month, you will be charged $49 per user plus tax for the selected package
        </p>
        <div className="flex items-center justify-between font-medium text-sm text-text-600 border-t border-element-light-lighter-400 py-4">
          <span>TVA amount</span>
          <span>$19,98 HT</span>
        </div>
        <div className="flex items-center justify-between font-medium text-sm text-text-600 border-t border-element-light-lighter-400 pt-4">
          <span>Amount billed now</span>
          <span>$124,00 HT</span>
        </div>
      </div>
    </div>
  )
}

export default CheckoutUpgradeModal
