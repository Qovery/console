import { CardCVV, CardComponent, CardExpiry, CardNumber, Provider } from '@chargebee/chargebee-js-react-wrapper'
import type FieldContainer from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { type BillingInfoRequest } from 'qovery-typescript-axios'
import { type FormEventHandler, type RefObject } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { Button, Icon, InputSelect, InputText, LoaderSpinner } from '@qovery/shared/ui'
import { fieldStyles } from '@qovery/shared/util-payment'

export interface BillingDetailsProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loadingBillingInfos?: boolean
  editInProcess?: boolean
  countryValues?: Value[]
  showAddCard?: boolean
  cbInstance?: CbInstance | null
  cardRef?: RefObject<FieldContainer>
  onCardReady?: () => void
  onAddCard?: () => void
  onCancelAddCard?: () => void
  showOnlyCardFields?: boolean
}

export function BillingDetails(props: BillingDetailsProps) {
  const { control, formState } = useFormContext<BillingInfoRequest>()

  // If we only show card fields, render only the Chargebee form
  if (props.showOnlyCardFields && props.showAddCard) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-medium text-neutral-400">Add credit card</h4>
          <button
            type="button"
            onClick={props.onCancelAddCard}
            className="text-sm text-neutral-350 hover:text-neutral-400"
          >
            Cancel
          </button>
        </div>

        {!props.cbInstance ? (
          <div className="flex justify-center py-4">
            <LoaderSpinner />
          </div>
        ) : (
          <Provider cbInstance={props.cbInstance}>
            <CardComponent
              ref={props.cardRef}
              styles={fieldStyles}
              locale="en"
              currency="USD"
              onReady={props.onCardReady}
            >
              <div className="chargebee-field-wrapper">
                <label className="chargebee-field-label">Card Number</label>
                <CardNumber placeholder="1234 1234 1234 1234" />
              </div>
              <div className="chargebee-fields-row">
                <div className="chargebee-field-wrapper">
                  <label className="chargebee-field-label">Expiry</label>
                  <CardExpiry placeholder="MM / YY" />
                </div>
                <div className="chargebee-field-wrapper">
                  <label className="chargebee-field-label">CVV</label>
                  <CardCVV placeholder="CVV" />
                </div>
              </div>
            </CardComponent>
          </Provider>
        )}
      </>
    )
  }

  return (
    <>
      <h3 className="mb-5 text-sm font-medium text-neutral-400">Billing information</h3>
      {props.loadingBillingInfos ? (
        <div className="flex justify-center">
          <LoaderSpinner />
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            <Controller
              control={control}
              name="first_name"
              rules={{ required: 'Please provide a first name' }}
              render={({ field }) => (
                <InputText
                  className="mb-3 flex-grow"
                  name={field.name}
                  label="First name"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="last_name"
              rules={{ required: 'Please provide a last name' }}
              render={({ field }) => (
                <InputText
                  className="mb-3 flex-grow"
                  name={field.name}
                  label="Last name"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex gap-3">
            <Controller
              control={control}
              name="company"
              render={({ field }) => (
                <InputText
                  className="mb-3 flex-grow"
                  name={field.name}
                  label="Company name (optional)"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="vat_number"
              render={({ field }) => (
                <InputText
                  className="mb-3 flex-grow"
                  name={field.name}
                  label="Vat number"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <Controller
            control={control}
            name="email"
            rules={{ required: 'Please provide a billing email' }}
            render={({ field }) => (
              <InputText
                className="mb-3 flex-grow"
                name={field.name}
                label="Billing email"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <InputText
                className="mb-3 flex-grow"
                name={field.name}
                label="Address (optional)"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div className="flex gap-3">
            <Controller
              control={control}
              name="city"
              render={({ field }) => (
                <InputText
                  className="mb-3 flex-grow"
                  name={field.name}
                  label="City (optional)"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="zip"
              render={({ field }) => (
                <InputText
                  className="mb-3 flex-grow"
                  name={field.name}
                  label="Zip code (optional)"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="mb-3 flex gap-3">
            <Controller
              control={control}
              name="country_code"
              render={({ field }) => (
                <InputSelect
                  className="flex-1"
                  options={props.countryValues ?? []}
                  label="Country (optional)"
                  value={field.value}
                  onChange={field.onChange}
                  isSearchable
                />
              )}
            />
            <Controller
              control={control}
              name="state"
              render={({ field }) => (
                <InputText
                  className="flex-1"
                  name={field.name}
                  label="State (optional)"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button
              data-testid="submit-button"
              type="submit"
              size="lg"
              disabled={!formState.isValid}
              loading={props.editInProcess}
              onClick={props.onSubmit as () => void}
            >
              Save
            </Button>
          </div>
        </>
      )}
    </>
  )
}

export default BillingDetails
