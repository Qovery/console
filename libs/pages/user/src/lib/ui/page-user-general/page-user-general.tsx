import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { BlockContent, Button, ButtonSize, ButtonStyle, InputSelect, InputText } from '@qovery/shared/ui'

export interface PageUserGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
  picture: string
  accountOptions: Value[]
}

export function PageUserGeneral({ onSubmit, loading, picture, accountOptions }: PageUserGeneralProps) {
  const { control, formState, watch } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h1 className="h5 mb-10 text-neutral-400">General account settings</h1>
        <form onSubmit={onSubmit}>
          <BlockContent title="User profile">
            <div className="flex items-center">
              <div>
                <img className="rounded-full w-16 h-16 border border-neutral-50" src={picture} alt="User profile" />
              </div>
              <div className="ml-5">
                <p className="text-neutral-400 font-medium ml-5">
                  {watch('firstName')} {watch('lastName')}
                </p>
              </div>
            </div>
            <hr className="my-5 border-0 border-b border-neutral-250 relative -left-5 w-[calc(100%+41px)]" />
            <div className="flex mb-3">
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'Please enter a first name.' }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    className="w-full mr-1.5"
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value}
                    label="First name"
                    error={error?.message}
                    disabled
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Please enter a last name.' }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    className="w-full ml-1.5"
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value}
                    label="Last name"
                    error={error?.message}
                    disabled
                  />
                )}
              />
            </div>
            <Controller
              name="account"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  label="Account email"
                  className="mb-3"
                  options={accountOptions}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  disabled
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Please enter a email.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email.',
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  type="email"
                  className="mb-3"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  label="Communication email"
                />
              )}
            />
          </BlockContent>
          <div className="flex justify-end">
            <Button
              dataTestId="submit-button"
              className="btn--no-min-w"
              size={ButtonSize.LARGE}
              style={ButtonStyle.BASIC}
              type="submit"
              disabled={!formState.isValid}
              loading={loading}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PageUserGeneral
