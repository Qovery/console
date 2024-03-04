import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { BlockContent, Button, Heading, InputSelect, InputText, Section } from '@qovery/shared/ui'

export interface PageUserGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
  picture: string
  accountOptions: Value[]
}

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const timezoneOffset = new Date().getTimezoneOffset() / -60

export function PageUserGeneral({ onSubmit, loading, picture, accountOptions }: PageUserGeneralProps) {
  const { control, formState, watch } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-10">General account settings</Heading>
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
            <InputText
              name="timezone"
              value={`${timeZone} (UTC${Math.sign(timezoneOffset) === -1 ? '-' : '+'}${timezoneOffset})`}
              label="Timezone (auto-detected by browser)"
              disabled
            />
            <p className="text-neutral-350 text-xs mt-1 mb-3">
              Timezone used to display timestamp within the interface
            </p>
          </BlockContent>
          <div className="flex justify-end">
            <Button data-testid="submit-button" size="lg" type="submit" disabled={!formState.isValid} loading={loading}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageUserGeneral
