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
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <Heading className="mb-10">General account settings</Heading>
        <form onSubmit={onSubmit}>
          <BlockContent title="User profile">
            <div className="flex items-center">
              <div>
                <img className="h-16 w-16 rounded-full border border-neutral-50" src={picture} alt="User profile" />
              </div>
              <div className="ml-5">
                <p className="ml-5 font-medium text-neutral-400">
                  {watch('firstName')} {watch('lastName')}
                </p>
              </div>
            </div>
            <hr className="relative -left-5 my-5 w-[calc(100%+41px)] border-0 border-b border-neutral-250" />
            <div className="mb-3 flex">
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'Please enter a first name.' }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    className="mr-1.5 w-full"
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
                    className="ml-1.5 w-full"
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
            <p className="mb-3 mt-1 text-xs text-neutral-350">
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
