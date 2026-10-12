import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Button, InputTextSmall } from '@qovery/shared/ui'
import { SSO_DOMAIN_PATTERN } from './auth-page-utils'

export interface SsoLoginFormProps {
  defaultDomain?: string
  onConnect: (domain: string) => void
  onBack: () => void
}

export function SsoLoginForm({ defaultDomain, onConnect, onBack }: SsoLoginFormProps) {
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      ssoDomain: defaultDomain ?? '',
    },
  })
  const ssoDomain = methods.watch('ssoDomain')

  return (
    <FormProvider {...methods}>
      <form className="flex flex-col" onSubmit={methods.handleSubmit(({ ssoDomain }) => onConnect(ssoDomain))}>
        <Controller
          name="ssoDomain"
          control={methods.control}
          rules={{
            required: 'Please enter a domain.',
            pattern: {
              value: SSO_DOMAIN_PATTERN,
              message: 'Invalid domain format',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall
              label="Company domain"
              placeholder="Enter your domain (e.g., company.com)"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={error?.message}
              className="[&_.input--small]:h-10 [&_.input--small]:min-h-10"
              autoFocus
            />
          )}
        />
        <div className="mt-2 flex flex-col gap-2">
          <Button
            type="submit"
            variant="solid"
            color="brand"
            size="lg"
            className="relative w-full justify-center"
            // Derived from the value rather than `formState.isValid`, which isn't computed for a pre-filled domain
            disabled={!SSO_DOMAIN_PATTERN.test(ssoDomain)}
          >
            Connect
          </Button>
          <Button
            type="button"
            onClick={onBack}
            variant="plain"
            color="neutral"
            size="lg"
            className="w-full justify-center"
          >
            Change login method
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
