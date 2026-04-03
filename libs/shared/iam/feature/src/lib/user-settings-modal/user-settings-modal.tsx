import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useAuth } from '@qovery/shared/auth'
import { type IconEnum } from '@qovery/shared/enums'
import { Button, Icon, InputSelect, InputText } from '@qovery/shared/ui'
import { useUserAccount } from '../use-user-account/use-user-account'
import { useEditUserAccount } from '../use-user-edit-account/use-user-edit-account'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const timezoneOffset = new Date().getTimezoneOffset() / -60

export function UserSettingsModal() {
  const { user: userToken } = useAuth()
  const { data: user } = useUserAccount()
  const { mutateAsync, isLoading: loading } = useEditUserAccount()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: user?.first_name,
      lastName: user?.last_name,
      email: user?.communication_email ?? '',
      account: userToken?.sub,
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data) {
      await mutateAsync({
        ...user,
        communication_email: data.email,
      })
    }
  })

  const userGitProvider = userToken?.sub?.includes('Gitlab') ? 'gitlab' : userToken?.sub?.split('|')[0]

  const accountOptions = [
    {
      label: `${userToken?.email} (${userGitProvider})`,
      value: userToken?.sub || '',
      icon: <Icon name={userGitProvider?.toUpperCase() as IconEnum} className="w-4" />,
    },
  ]

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="p-5">
        <div className="flex items-center">
          <div>
            <img
              className="h-10 w-10 rounded-full border border-neutral"
              src={user?.profile_picture_url as string}
              alt="User profile"
            />
          </div>
          <p className="ml-3 font-medium text-neutral">
            {methods.watch('firstName')} {methods.watch('lastName')}
          </p>
        </div>
        <hr className="relative -left-5 my-5 w-[calc(100%+41px)] border-0 border-b border-neutral" />
        <div className="mb-3 flex">
          <Controller
            name="firstName"
            control={methods.control}
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
            control={methods.control}
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
          control={methods.control}
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
          control={methods.control}
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
          hint="Timezone used to display timestamp within the interface"
        />
        <div className="mt-6 flex justify-end">
          <Button size="lg" type="submit" disabled={!methods.formState.isValid} loading={loading}>
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default UserSettingsModal
