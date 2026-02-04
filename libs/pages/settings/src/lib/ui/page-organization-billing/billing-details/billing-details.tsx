import { type BillingInfoRequest } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { Button, InputSelect, InputText, LoaderSpinner } from '@qovery/shared/ui'

export interface BillingDetailsProps {
  onSubmit?: FormEventHandler<HTMLFormElement>
  loadingBillingInfos?: boolean
  editInProcess?: boolean
  countryValues?: Value[]
}

export function BillingDetails(props: BillingDetailsProps) {
  const { control, formState } = useFormContext<BillingInfoRequest>()

  return (
    <>
      <h3 className="mb-5 text-sm font-medium text-neutral-400">Billing information</h3>
      {props.loadingBillingInfos ? (
        <div className="flex justify-center">
          <LoaderSpinner />
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <Controller
              control={control}
              name="first_name"
              rules={{ required: 'Please provide a first name' }}
              render={({ field }) => (
                <InputText
                  className="mb-3 min-w-0 flex-1"
                  name={field.name}
                  label="First name"
                  value={field.value}
                  onChange={field.onChange}
                  error={formState.errors.first_name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="last_name"
              rules={{ required: 'Please provide a last name' }}
              render={({ field }) => (
                <InputText
                  className="mb-3 min-w-0 flex-1"
                  name={field.name}
                  label="Last name"
                  value={field.value}
                  onChange={field.onChange}
                  error={formState.errors.last_name?.message}
                />
              )}
            />
          </div>
          <div className="flex items-start gap-3">
            <Controller
              control={control}
              name="company"
              render={({ field }) => (
                <InputText
                  className="mb-3 min-w-0 flex-1"
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
              rules={{ required: 'Please provide a VAT number' }}
              render={({ field }) => (
                <InputText
                  className="mb-3 min-w-0 flex-1"
                  name={field.name}
                  label="VAT number"
                  value={field.value}
                  onChange={field.onChange}
                  error={formState.errors.vat_number?.message}
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
                className="mb-3 min-w-0 flex-1"
                name={field.name}
                label="Billing email"
                value={field.value}
                onChange={field.onChange}
                error={formState.errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="address"
            rules={{ required: 'Please provide an address' }}
            render={({ field }) => (
              <InputText
                className="mb-3 min-w-0 flex-1"
                name={field.name}
                label="Address"
                value={field.value}
                onChange={field.onChange}
                error={formState.errors.address?.message}
              />
            )}
          />
          <div className="flex items-start gap-3">
            <Controller
              control={control}
              name="city"
              rules={{ required: 'Please provide a city' }}
              render={({ field }) => (
                <InputText
                  className="mb-3 min-w-0 flex-1"
                  name={field.name}
                  label="City"
                  value={field.value}
                  onChange={field.onChange}
                  error={formState.errors.city?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="zip"
              rules={{ required: 'Please provide a zip code' }}
              render={({ field }) => (
                <InputText
                  className="mb-3 min-w-0 flex-1"
                  name={field.name}
                  label="Zip code"
                  value={field.value}
                  onChange={field.onChange}
                  error={formState.errors.zip?.message}
                />
              )}
            />
          </div>
          <div className="mb-3 flex gap-3">
            <Controller
              control={control}
              name="country_code"
              rules={{ required: 'Please select a country' }}
              render={({ field }) => (
                <InputSelect
                  className="flex-1"
                  options={props.countryValues ?? []}
                  label="Country"
                  value={field.value}
                  onChange={field.onChange}
                  isSearchable
                  error={formState.errors.country_code?.message}
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
