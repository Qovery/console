import { type Cluster, type SecretManagerAccess } from 'qovery-typescript-axios'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { P, match } from 'ts-pattern'
import { type Value } from '@qovery/shared/interfaces'
import { ExternalLink, Heading, InputSelect, InputText, Section, Tooltip } from '@qovery/shared/ui'
import { type AwsManualAuthenticationTypeSelect } from '../secret-manager-integration-constraints'
import { type SecretManagerOption } from '../secret-manager-integration.types'
import { SecretManagerNameField, SecretManagerRegionField } from './secret-manager-integration-fields'

interface AwsSecretManagerManualSectionsProps {
  authenticationTypeSelect?: AwsManualAuthenticationTypeSelect
  cluster?: Cluster
  isManualOnlyIntegration: boolean
  methods: UseFormReturn<SecretManagerAccess>
  option: SecretManagerOption
  regions: Value[]
}

export function AwsSecretManagerManualSections({
  authenticationTypeSelect,
  cluster,
  isManualOnlyIntegration,
  methods,
  option,
  regions,
}: AwsSecretManagerManualSectionsProps) {
  if (isManualOnlyIntegration) {
    return (
      <div className="flex flex-col gap-4">
        <AwsStaticCredentialsSections methods={methods} regions={regions} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <AwsAuthenticationTypeSelect authenticationTypeSelect={authenticationTypeSelect} methods={methods} />
      <AwsManualAuthenticationModeSections cluster={cluster} methods={methods} option={option} regions={regions} />
    </div>
  )
}

function AwsCredentialsInstructions() {
  return (
    <Section className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
      <Heading level={3} className="text-sm font-medium text-neutral">
        1. Create a user for Qovery
      </Heading>
      <p className="text-sm text-neutral-subtle">Follow the instructions available on this page</p>
      <ExternalLink href="https://www.qovery.com/docs/getting-started/installation/aws#create-your-cluster" size="sm">
        How to create new credentials
      </ExternalLink>
    </Section>
  )
}

interface AwsStaticCredentialsSectionsProps {
  methods: UseFormReturn<SecretManagerAccess>
  regions: Value[]
  syncAuthenticationRegion?: boolean
}

function AwsStaticCredentialsSections({
  methods,
  regions,
  syncAuthenticationRegion = false,
}: AwsStaticCredentialsSectionsProps) {
  return (
    <>
      <AwsCredentialsInstructions />
      <Section className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
        <Heading level={3} className="text-sm font-medium text-neutral">
          2. Fill in these information
        </Heading>
        <SecretManagerRegionField
          methods={methods}
          regions={regions}
          onRegionChange={
            syncAuthenticationRegion ? (region) => methods.setValue('authentication.region', region) : undefined
          }
        />
        <Controller
          name="authentication.access_key"
          control={methods.control}
          rules={{
            required: 'Please enter your access key.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              label="Access key"
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="authentication.secret_key"
          control={methods.control}
          rules={{
            required: 'Please enter your secret access key.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              label="Secret access key"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={error?.message}
            />
          )}
        />
        <SecretManagerNameField methods={methods} />
      </Section>
    </>
  )
}

interface AwsAuthenticationTypeSelectProps {
  authenticationTypeSelect?: AwsManualAuthenticationTypeSelect
  methods: UseFormReturn<SecretManagerAccess>
}

function AwsAuthenticationTypeSelect({ authenticationTypeSelect, methods }: AwsAuthenticationTypeSelectProps) {
  return (
    <Controller
      name="authentication.mode"
      control={methods.control}
      render={({ field }) => {
        const select = (
          <InputSelect
            label="Authentication type"
            value={field.value}
            placeholder="Select an authentication type"
            onChange={(value) => field.onChange(value as string)}
            options={authenticationTypeSelect?.options ?? []}
            disabled={authenticationTypeSelect?.disabled}
            portal
          />
        )

        if (authenticationTypeSelect?.disabled) {
          return (
            <Tooltip content={authenticationTypeSelect.disabledTooltip}>
              <div className="w-full">{select}</div>
            </Tooltip>
          )
        }

        return select
      }}
    />
  )
}

interface AwsManualAuthenticationModeSectionsProps {
  cluster?: Cluster
  methods: UseFormReturn<SecretManagerAccess>
  option: SecretManagerOption
  regions: Value[]
}

function AwsManualAuthenticationModeSections({
  cluster,
  methods,
  option,
  regions,
}: AwsManualAuthenticationModeSectionsProps) {
  const authenticationMode = methods.watch('authentication.mode')

  if (!authenticationMode) {
    return <p className="text-sm text-neutral-subtle">Select an authentication type to see the required information.</p>
  }

  if (authenticationMode === 'AWS_STATIC_CREDENTIALS') {
    return <AwsStaticCredentialsSections methods={methods} regions={regions} syncAuthenticationRegion />
  }

  return <AwsAssumeRoleSections cluster={cluster} methods={methods} option={option} regions={regions} />
}

function AwsAssumeRoleSections({ cluster, methods, option, regions }: AwsManualAuthenticationModeSectionsProps) {
  const templateURL = `https://s3.amazonaws.com/cloudformation-aws-secrets-manager-role/template.json`
  const providerURL = match(cluster?.infrastructure_outputs)
    .with({ kind: 'GKE' }, { kind: 'SCW_KAPSULE' }, P.nullish, () => '')
    .otherwise((o) => o.cluster_oidc_issuer)
  const stackName =
    option.value === 'AWS_PARAMETER_STORE'
      ? 'qovery-parameter-store-role-creation'
      : 'qovery-secrets-manager-role-creation'
  const cloudformationUrl = `https://console.aws.amazon.com/cloudformation/home?#/stacks/quickcreate?templateURL=${templateURL}&stackName=${stackName}&param_OIDCProviderURL=${providerURL}`

  return (
    <div className="flex flex-col gap-4">
      <Section className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
        <Heading level={3} className="text-sm font-medium text-neutral">
          1. Connect to your AWS Console
        </Heading>
        <p className="text-sm text-neutral-subtle">Make sure you are connected to the right AWS account</p>
        <ExternalLink href="https://aws.amazon.com/fr/console/" size="sm">
          https://aws.amazon.com/fr/console/
        </ExternalLink>
      </Section>
      <Section className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
        <Heading level={3} className="text-sm font-medium text-neutral">
          2. Create a role for Qovery and grant assume role permissions
        </Heading>
        <p className="text-sm text-neutral-subtle">
          Execute the following Cloudformation stack and retrieve the role ARN from the “Output” section.
        </p>
        <ExternalLink href={cloudformationUrl} size="sm">
          Cloudformation stack
        </ExternalLink>
      </Section>
      <Section className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
        <Heading level={3} className="text-sm font-medium text-neutral">
          3. Provide your credentials info
        </Heading>
        <SecretManagerRegionField methods={methods} regions={regions} />
        <Controller
          name="authentication.role_arn"
          control={methods.control}
          rules={{
            required: 'Please enter your role ARN.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              label="Role ARN"
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
            />
          )}
        />
        <SecretManagerNameField methods={methods} />
      </Section>
    </div>
  )
}
