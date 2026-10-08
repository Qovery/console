import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Button, InputTextSmall } from '@qovery/shared/ui'
import { SSO_DOMAIN_PATTERN } from './auth-page-utils'
import { AUTH_PAGE_COPY } from './auth-page.copy'

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
      <div className="flex flex-col">
        <Controller
          name="ssoDomain"
          control={methods.control}
          rules={{
            required: AUTH_PAGE_COPY.sso.domainRequired,
            pattern: {
              value: SSO_DOMAIN_PATTERN,
              message: AUTH_PAGE_COPY.sso.domainInvalid,
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall
              label={AUTH_PAGE_COPY.sso.domainLabel}
              placeholder={AUTH_PAGE_COPY.sso.domainPlaceholder}
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
            onClick={methods.handleSubmit(({ ssoDomain }) => onConnect(ssoDomain))}
            // Derived from the value rather than `formState.isValid`, which isn't computed for a pre-filled domain
            disabled={!SSO_DOMAIN_PATTERN.test(ssoDomain)}
          >
            {AUTH_PAGE_COPY.sso.connect}
          </Button>
          <Button onClick={onBack} variant="plain" color="neutral" size="lg" className="w-full justify-center">
            {AUTH_PAGE_COPY.sso.changeLoginMethod}
          </Button>
        </div>
      </div>
    </FormProvider>
  )
}
