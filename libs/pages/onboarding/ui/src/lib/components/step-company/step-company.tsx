import { Dispatch, SetStateAction } from 'react'
import { Control, Controller, ErrorOption, UseFormRegister } from 'react-hook-form'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputText } from '@console/shared/ui'
import { Value } from '@console/shared/interfaces'

interface StepCompanyProps {
  dataSize: Array<Value>
  dataRole: Array<Value>
  onSubmit: () => void
  register: UseFormRegister<any>
  control: Control<any, any>
  errors: { [key: string]: ErrorOption }
  defaultValues: { [x: string]: string }
  setStepCompany: Dispatch<SetStateAction<boolean>>
}

export function StepCompany(props: StepCompanyProps) {
  const { dataSize, dataRole, onSubmit, defaultValues, register, control, errors, setStepCompany } = props

  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">About your company</h1>
      <p className="text-sm mb-10 text-text-500">We need some information to proceed with your account creation.</p>
      <form onSubmit={onSubmit}>
        <InputText
          className="mb-3"
          name="company_name"
          label="Company"
          defaultValue={defaultValues['company_name']}
          register={register}
          required="Please enter your company name."
          error={errors && errors['company_name']?.message}
        />
        <Controller
          name="company_size"
          control={control}
          rules={{ required: 'Please enter your company size.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-3"
              label="Company size"
              items={dataSize}
              onChange={field.onChange}
              value={field.value}
              inputRef={field.ref}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="user_role"
          control={control}
          rules={{ required: 'Please enter your role.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-3"
              label="Role"
              items={dataRole}
              onChange={field.onChange}
              value={field.value}
              inputRef={field.ref}
              error={error?.message}
            />
          )}
        />
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            onClick={() => setStepCompany(false)}
            size={ButtonSize.BIG}
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          <Button size={ButtonSize.BIG} style={ButtonStyle.BASIC} type="submit">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepCompany
