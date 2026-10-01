import { type BillingInfoRequest } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { EU_COUNTRY_CODES, countries } from '@qovery/shared/enums'
import { Button, IconFlag, InputSelect, InputText } from '@qovery/shared/ui'
import { validatePostalCode, validateRequiredField, validateVatNumber } from './billing-details-validation'

export interface BillingDetailsProps {
  onSubmit?: FormEventHandler<HTMLFormElement>
  editInProcess?: boolean
  submitDisabled?: boolean
  submitLabel?: string
}

const countryValues = countries.map((country) => ({
  label: country.name,
  value: country.code,
  icon: <IconFlag code={country.code} />,
}))

export function BillingDetails({ onSubmit, editInProcess, submitDisabled, submitLabel = 'Save' }: BillingDetailsProps) {
  const { clearErrors, control, formState } = useFormContext<BillingInfoRequest>()
  const countryCode = useWatch({ control, name: 'country_code' })
  const isEuCountry = EU_COUNTRY_CODES.has(countryCode)

  return (
    <>
      <h3 className="mb-5 text-sm font-medium text-neutral">Billing information</h3>
      <div className="flex items-start gap-3">
        <Controller
          control={control}
          name="first_name"
          rules={{ validate: (value) => validateRequiredField(value, 'Please provide a first name') }}
          render={({ field }) => (
            <InputText
              className="mb-3 min-w-0 flex-1"
              name={field.name}
              label="First name"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={formState.errors.first_name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="last_name"
          rules={{ validate: (value) => validateRequiredField(value, 'Please provide a last name') }}
          render={({ field }) => (
            <InputText
              className="mb-3 min-w-0 flex-1"
              name={field.name}
              label="Last name"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
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
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="vat_number"
          rules={{ validate: (value) => validateVatNumber(value, countryCode) }}
          render={({ field }) => (
            <InputText
              className="mb-3 min-w-0 flex-1"
              name={field.name}
              label={`VAT number${isEuCountry ? '' : ' (optional)'}`}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={formState.errors.vat_number?.message}
            />
          )}
        />
      </div>
      <Controller
        control={control}
        name="email"
        rules={{ validate: (value) => validateRequiredField(value, 'Please provide a billing email') }}
        render={({ field }) => (
          <InputText
            className="mb-3 min-w-0 flex-1"
            name={field.name}
            label="Billing email"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={formState.errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="address"
        rules={{ validate: (value) => validateRequiredField(value, 'Please provide an address') }}
        render={({ field }) => (
          <InputText
            className="mb-3 min-w-0 flex-1"
            name={field.name}
            label="Address"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={formState.errors.address?.message}
          />
        )}
      />
      <div className="flex items-start gap-3">
        <Controller
          control={control}
          name="city"
          rules={{ validate: (value) => validateRequiredField(value, 'Please provide a city') }}
          render={({ field }) => (
            <InputText
              className="mb-3 min-w-0 flex-1"
              name={field.name}
              label="City"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={formState.errors.city?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="zip"
          rules={{ validate: (value) => validatePostalCode(value, countryCode) }}
          render={({ field }) => (
            <InputText
              className="mb-3 min-w-0 flex-1"
              name={field.name}
              label="Postal code"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
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
              options={countryValues}
              label="Country"
              value={field.value}
              onChange={(value) => {
                field.onChange(value)
                clearErrors(['vat_number', 'zip'])
              }}
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
              onBlur={field.onBlur}
            />
          )}
        />
      </div>
      <div className="flex justify-end">
        <Button
          data-testid="submit-button"
          type="submit"
          size="lg"
          loading={editInProcess}
          disabled={submitDisabled}
          onClick={onSubmit as () => void}
        >
          {submitLabel}
        </Button>
      </div>
    </>
  )
}

export default BillingDetails
