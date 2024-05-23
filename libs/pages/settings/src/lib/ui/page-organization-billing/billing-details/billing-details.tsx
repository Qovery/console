import { type BillingInfoRequest } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { BlockContent, Button, InputSelect, InputText, LoaderSpinner } from '@qovery/shared/ui'

export interface BillingDetailsProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loadingBillingInfos?: boolean
  editInProcess?: boolean
  countryValues?: Value[]
}

export function BillingDetails(props: BillingDetailsProps) {
  const { control, formState } = useFormContext<BillingInfoRequest>()

  return (
    <BlockContent title="Billing details">
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
    </BlockContent>
  )
}

export default BillingDetails
