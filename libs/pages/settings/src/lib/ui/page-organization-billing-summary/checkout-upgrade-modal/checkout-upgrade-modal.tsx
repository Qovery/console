import { PlanEnum } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { CreditCardForm, CreditCardFormValues } from '@qovery/shared/console-shared'
import { Value } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle, InputSelect } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface CheckoutUpgradeModalProps {
  plan: PlanEnum
  memberCount: number
  onCardSubmit: FormEventHandler<HTMLFormElement>
  showAddCardForm: boolean
  toggleShowAddForm: (value: boolean) => void
  selectedCard: string | undefined
  setSelectedCard: (value: string) => void
  creditCardsOptions: Value[]
}

export function CheckoutUpgradeModal(props: CheckoutUpgradeModalProps) {
  const { formState } = useFormContext<CreditCardFormValues>()

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-2 max-w-lg mb-8">
        Confirm your change to the {upperCaseFirstLetter(props.plan)} plan for $49 per user
      </h2>
      <div className="bg-element-light-lighter-200 border border-element-light-lighter-500 rounded px-6 py-5 mb-8">
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

      {!props.showAddCardForm ? (
        <div className="bg-brand-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-text-500 font-medium">Pay with</div>
            <div
              className="text-brand-500 font-medium text-sm cursor-pointer"
              onClick={() => props.toggleShowAddForm(true)}
            >
              Add a new card
            </div>
          </div>
          <div className="">
            <InputSelect
              className="mb-5"
              label="Card number"
              options={[]}
              portal
              onChange={(value) => props.setSelectedCard(value as string)}
            />

            <p className="text-text-500 text-sm mb-6">
              Price paid and delta Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit
              officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </p>
            <p className="text-center text-text-500 text-sm mb-6">
              Card information are secured by <strong>Stripe</strong>
            </p>

            <Button
              className="w-full"
              style={ButtonStyle.BASIC}
              size={ButtonSize.XLARGE}
              disabled={!props.selectedCard}
            >
              Confirm
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-brand-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-text-500 font-medium">Register your credit card</div>
            <div
              className="text-brand-500 font-medium text-sm cursor-pointer"
              onClick={() => props.toggleShowAddForm(false)}
            >
              Cancel
            </div>
          </div>
          <div className="">
            <form onSubmit={props.onCardSubmit}>
              <CreditCardForm />
              <p className="text-center text-text-500 text-sm my-6">
                Card information are secured by <strong>Stripe</strong>
              </p>
              <Button
                className="w-full"
                style={ButtonStyle.BASIC}
                size={ButtonSize.XLARGE}
                type="submit"
                disabled={!formState.isValid}
              >
                Confirm
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckoutUpgradeModal
