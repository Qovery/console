import {
  CloudflareDnsProviderRequestProviderEnum,
  type ClusterDnsProviderRequest,
  type ClusterDnsProviderResponse,
  PlanEnum,
  QoveryDnsProviderRequestProviderEnum,
  Route53DnsProviderRequestProviderEnum,
  Route53StaticCredentialsRequestTypeEnum,
} from 'qovery-typescript-axios'
import {
  Controller,
  FormProvider,
  type RegisterOptions,
  type SubmitHandler,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form'
import { match } from 'ts-pattern'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { type Value } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  Callout,
  ExternalLink,
  Icon,
  InputSelect,
  InputText,
  InputToggle,
  Link,
  Section,
} from '@qovery/shared/ui'

const SECRET_HINT =
  'For security reasons, this secret is not returned by the API and must be filled again to save changes.'
const DNS_PROVIDER_DOCUMENTATION_URL =
  'https://www.qovery.com/docs/configuration/clusters#custom-domain-and-wildcard-tls-beta'

export type DnsProvider = ClusterDnsProviderRequest['dns_provider']['provider']

export interface ClusterDnsProviderFormValues {
  provider: DnsProvider
  domain: string
  cloudflareEmail: string
  cloudflareApiToken: string
  cloudflareProxied: boolean
  route53AwsAccessKeyId: string
  route53AwsSecretAccessKey: string
  route53AwsRegion: string
  route53HostedZoneId: string
}

export const DNS_PROVIDER_OPTIONS: Value[] = [
  { label: 'Qovery', value: 'QOVERY' },
  { label: 'Cloudflare', value: 'CLOUDFLARE' },
  { label: 'Route53', value: 'ROUTE53' },
]

export function canEditDnsProvider(plan?: string): boolean {
  return (
    plan === PlanEnum.BUSINESS ||
    plan === PlanEnum.BUSINESS_2025 ||
    plan === PlanEnum.ENTERPRISE ||
    plan === PlanEnum.ENTERPRISE_YEARLY ||
    plan === PlanEnum.ENTERPRISE_2025
  )
}

export function isForbiddenError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'status' in error.response &&
    error.response.status === 403
  )
}

export function createClusterDnsProviderFormValues(
  clusterDnsProvider?: ClusterDnsProviderResponse
): ClusterDnsProviderFormValues {
  const dnsProvider = clusterDnsProvider?.dns_provider

  return match(dnsProvider)
    .with({ provider: 'CLOUDFLARE' }, (provider) => ({
      provider: provider.provider,
      domain: provider.domain,
      cloudflareEmail: provider.email,
      cloudflareApiToken: '',
      cloudflareProxied: provider.proxied ?? false,
      route53AwsAccessKeyId: '',
      route53AwsSecretAccessKey: '',
      route53AwsRegion: '',
      route53HostedZoneId: '',
    }))
    .with({ provider: 'ROUTE53' }, (provider) => ({
      provider: provider.provider,
      domain: provider.domain,
      cloudflareEmail: '',
      cloudflareApiToken: '',
      cloudflareProxied: false,
      route53AwsAccessKeyId: provider.credentials.aws_access_key_id,
      route53AwsSecretAccessKey: '',
      route53AwsRegion: provider.aws_region,
      route53HostedZoneId: provider.hosted_zone_id ?? '',
    }))
    .with({ provider: 'QOVERY' }, (provider) => ({
      provider: provider.provider,
      domain: provider.domain,
      cloudflareEmail: '',
      cloudflareApiToken: '',
      cloudflareProxied: false,
      route53AwsAccessKeyId: '',
      route53AwsSecretAccessKey: '',
      route53AwsRegion: '',
      route53HostedZoneId: '',
    }))
    .otherwise(() => ({
      provider: 'QOVERY',
      domain: '',
      cloudflareEmail: '',
      cloudflareApiToken: '',
      cloudflareProxied: false,
      route53AwsAccessKeyId: '',
      route53AwsSecretAccessKey: '',
      route53AwsRegion: '',
      route53HostedZoneId: '',
    }))
}

export function buildClusterDnsProviderRequest(values: ClusterDnsProviderFormValues): ClusterDnsProviderRequest {
  return match(values)
    .with({ provider: 'CLOUDFLARE' }, (data) => ({
      dns_provider: {
        provider: CloudflareDnsProviderRequestProviderEnum.CLOUDFLARE,
        domain: data.domain,
        email: data.cloudflareEmail,
        api_token: data.cloudflareApiToken,
        proxied: data.cloudflareProxied,
      },
    }))
    .with({ provider: 'ROUTE53' }, (data) => ({
      dns_provider: {
        provider: Route53DnsProviderRequestProviderEnum.ROUTE53,
        domain: data.domain,
        credentials: {
          type: Route53StaticCredentialsRequestTypeEnum.STATIC,
          aws_access_key_id: data.route53AwsAccessKeyId,
          aws_secret_access_key: data.route53AwsSecretAccessKey,
        },
        aws_region: data.route53AwsRegion,
        hosted_zone_id: data.route53HostedZoneId || null,
      },
    }))
    .with({ provider: 'QOVERY' }, (data) => ({
      dns_provider: {
        provider: QoveryDnsProviderRequestProviderEnum.QOVERY,
        domain: data.domain,
      },
    }))
    .exhaustive()
}

function DnsProviderFields({ disabled }: { disabled: boolean }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<ClusterDnsProviderFormValues>()
  const provider = useWatch({ control, name: 'provider' })
  const isQoveryProvider = provider === 'QOVERY'

  return (
    <div className="flex flex-col gap-3">
      <ControllerInputSelect name="provider" label="DNS provider" options={DNS_PROVIDER_OPTIONS} disabled={disabled} />

      <ControllerInputText
        name="domain"
        label="Domain"
        disabled={disabled || isQoveryProvider}
        rules={{ required: 'Please enter a domain.' }}
      />

      {provider === 'CLOUDFLARE' && (
        <>
          <ControllerInputText
            name="cloudflareEmail"
            label="Email"
            type="email"
            disabled={disabled}
            rules={{ required: 'Please enter the Cloudflare email.' }}
          />
          <ControllerInputText
            name="cloudflareApiToken"
            label="API token"
            type="password"
            disabled={disabled}
            hint={SECRET_HINT}
            rules={{ required: disabled ? false : 'Please enter the Cloudflare API token.' }}
          />
          <ControllerInputToggle
            name="cloudflareProxied"
            title="Proxy DNS records through Cloudflare"
            disabled={disabled}
          />
        </>
      )}

      {provider === 'ROUTE53' && (
        <>
          <ControllerInputText
            name="route53AwsAccessKeyId"
            label="AWS access key ID"
            disabled={disabled}
            rules={{ required: 'Please enter the AWS access key ID.' }}
          />
          <ControllerInputText
            name="route53AwsSecretAccessKey"
            label="AWS secret access key"
            type="password"
            disabled={disabled}
            hint={SECRET_HINT}
            rules={{ required: disabled ? false : 'Please enter the AWS secret access key.' }}
          />
          <ControllerInputText
            name="route53AwsRegion"
            label="AWS region"
            disabled={disabled}
            rules={{ required: 'Please enter the AWS region.' }}
          />
          <ControllerInputText name="route53HostedZoneId" label="Hosted zone ID" disabled={disabled} />
        </>
      )}

      {errors.root?.message && <p className="px-3 text-xs text-negative">{errors.root.message}</p>}
    </div>
  )
}

type ControllerInputTextProps = {
  name: keyof ClusterDnsProviderFormValues
  label: string
  type?: 'text' | 'password' | 'email'
  disabled?: boolean
  hint?: string
  rules?: RegisterOptions<ClusterDnsProviderFormValues, keyof ClusterDnsProviderFormValues>
}

function ControllerInputText({ name, label, type = 'text', disabled, hint, rules }: ControllerInputTextProps) {
  const { control } = useFormContext<ClusterDnsProviderFormValues>()

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <InputText
          name={field.name}
          label={label}
          type={type}
          value={typeof field.value === 'string' ? field.value : ''}
          onChange={field.onChange}
          disabled={disabled}
          hint={hint}
          error={error?.message}
          dataTestId={`input-${name}`}
        />
      )}
    />
  )
}

function ControllerInputSelect({
  name,
  label,
  options,
  disabled,
}: {
  name: keyof ClusterDnsProviderFormValues
  label: string
  options: Value[]
  disabled?: boolean
}) {
  const { control } = useFormContext<ClusterDnsProviderFormValues>()

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: 'Please select a DNS provider.' }}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          label={label}
          options={options}
          onChange={field.onChange}
          value={typeof field.value === 'string' ? field.value : undefined}
          disabled={disabled}
          error={error?.message}
          dataTestId={`input-${name}`}
        />
      )}
    />
  )
}

function ControllerInputToggle({
  name,
  title,
  disabled,
}: {
  name: keyof ClusterDnsProviderFormValues
  title: string
  disabled?: boolean
}) {
  const { control } = useFormContext<ClusterDnsProviderFormValues>()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <InputToggle
          name={field.name}
          value={Boolean(field.value)}
          onChange={field.onChange}
          title={title}
          disabled={disabled}
          dataTestId={`input-${name}`}
          small
        />
      )}
    />
  )
}

export interface ClusterDnsProviderSettingsProps {
  organizationId: string
  clusterDnsProvider?: ClusterDnsProviderResponse
  disabled?: boolean
  submitError?: string
  isSubmitting?: boolean
  onSubmit: (request: ClusterDnsProviderRequest) => Promise<ClusterDnsProviderResponse | undefined>
}

export function ClusterDnsProviderSettings({
  organizationId,
  clusterDnsProvider,
  disabled = false,
  submitError,
  isSubmitting,
  onSubmit,
}: ClusterDnsProviderSettingsProps) {
  const methods = useForm<ClusterDnsProviderFormValues>({
    defaultValues: createClusterDnsProviderFormValues(clusterDnsProvider),
    mode: 'onChange',
  })

  const handleSubmit: SubmitHandler<ClusterDnsProviderFormValues> = async (data) => {
    const response = await onSubmit(buildClusterDnsProviderRequest(data))

    if (response) {
      methods.reset(createClusterDnsProviderFormValues(response))
    }
  }

  return (
    <FormProvider {...methods}>
      <Section className="p-8">
        <SettingsHeading
          title="DNS provider"
          description={
            <>
              Configure how Qovery propagates DNS records for this cluster custom domain through Qovery, Cloudflare, or
              Route53. This domain applies to every service running on this cluster. After changing the DNS provider,
              redeploy every service running on this cluster.{' '}
              <ExternalLink href={DNS_PROVIDER_DOCUMENTATION_URL} size="sm">
                Learn more
              </ExternalLink>
            </>
          }
        />
        <div className="max-w-content-with-navigation-left">
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            {disabled && (
              <Callout.Root color="neutral" className="mb-4">
                <Callout.Icon>
                  <Icon iconName="lock" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>
                    Changing the DNS provider requires a Business or Enterprise plan.
                  </Callout.TextHeading>
                  <Callout.TextDescription>
                    You can review the current configuration here or upgrade from{' '}
                    <Link to="/organization/$organizationId/settings/billing-summary" params={{ organizationId }}>
                      Billing & plans
                    </Link>
                    .
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            )}

            {submitError && (
              <Callout.Root color="red" className="mb-4">
                <Callout.Icon>
                  <Icon iconName="circle-exclamation" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextDescription>{submitError}</Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            )}

            <BlockContent title="Current DNS provider">
              <DnsProviderFields disabled={disabled || Boolean(isSubmitting)} />
            </BlockContent>

            <div className="flex justify-end">
              <Button
                data-testid="submit-button"
                type="submit"
                size="lg"
                loading={isSubmitting}
                disabled={disabled || !methods.formState.isValid}
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </Section>
    </FormProvider>
  )
}
