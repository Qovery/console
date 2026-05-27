import { type Cluster, type ClusterRegion, type SecretManagerAccess } from 'qovery-typescript-axios'
import { useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { P, match } from 'ts-pattern'
import { useCloudProviders } from '@qovery/domains/cloud-providers/feature'
import { type Value } from '@qovery/shared/interfaces'
import {
  Button,
  Callout,
  CopyButton,
  Dropzone,
  ExternalLink,
  Icon,
  IconFlag,
  InputSelect,
  InputText,
  Navbar,
  Tooltip,
} from '@qovery/shared/ui'
import { isGcpCluster } from '@qovery/shared/util-clusters'
import {
  type IntegrationTab,
  getActiveProviderConstraints,
  getSecretManagerIntegrationConstraints,
} from './secret-manager-integration-constraints'
import { type SecretManagerOption } from './secret-manager-integration.types'

export type { SecretManagerOption } from './secret-manager-integration.types'

export interface SecretManagerIntegrationModalProps {
  option: SecretManagerOption
  cluster?: Cluster
  mode?: 'create' | 'edit'
  initialValues?: SecretManagerAccess
  onClose: () => void
  onSubmit: (payload: SecretManagerAccess) => void
}

export function SecretManagerIntegrationModal({
  option,
  cluster,
  mode = 'create',
  initialValues,
  onClose,
  onSubmit,
}: SecretManagerIntegrationModalProps) {
  const constraints = useMemo(
    () => getSecretManagerIntegrationConstraints({ option, cluster, mode, initialValues }),
    [option, cluster, mode, initialValues]
  )

  const { navigation, layout, aws, defaultAuthenticationMode } = constraints
  const { isManualOnlyGcpIntegration, isManualOnlyAwsIntegration } = layout
  const providerTabs = getActiveProviderConstraints(constraints)
  const automaticTab = providerTabs?.automatic
  const awsManualAuthenticationTypeSelect = aws?.manual.authenticationTypeSelect

  const [activeTab, setActiveTab] = useState<IntegrationTab>(() => navigation.defaultTab)

  const methods = useForm<SecretManagerAccess>({
    mode: 'onChange',
    defaultValues: {
      ...initialValues,
      endpoint: {
        ...initialValues?.endpoint,
        mode: initialValues?.endpoint.mode ?? option.value,
      },
      authentication: {
        ...initialValues?.authentication,
        mode: initialValues?.authentication?.mode ?? defaultAuthenticationMode,
      },
    },
  })

  const setActiveTabWithDefaultAuthentication = useCallback(
    (tab: IntegrationTab) => {
      setActiveTab(tab)

      if (tab === 'manual' && !methods.getValues('authentication.mode') && defaultAuthenticationMode) {
        methods.setValue('authentication.mode', defaultAuthenticationMode, { shouldDirty: false })
      }
    },
    [defaultAuthenticationMode, methods]
  )
  const { data: cloudProviders = [] } = useCloudProviders()
  const awsRegions: Value[] = useMemo(() => {
    const awsProvider = cloudProviders.find((p) => p.short_name === 'AWS')
    return (
      awsProvider?.regions?.map((region: ClusterRegion) => ({
        label: `${region.city} (${region.name})`,
        value: region.name,
        icon: <IconFlag code={region.country_code} />,
      })) ?? []
    )
  }, [cloudProviders])
  const gcpRegions: Value[] = useMemo(() => {
    const gcpProvider = cloudProviders.find((p) => p.short_name === 'GCP')
    return (
      gcpProvider?.regions?.map((region: ClusterRegion) => ({
        label: `${region.city} (${region.name})`,
        value: region.name,
        icon: <IconFlag code={region.country_code} />,
      })) ?? []
    )
  }, [cloudProviders])
  const regions = option.value === 'GCP_SECRET_MANAGER' ? gcpRegions : awsRegions

  const isGcpManualTabOnGcpSecretManager =
    option.value === 'GCP_SECRET_MANAGER' && isGcpCluster(cluster) && activeTab === 'manual'
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number }>()
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles?.[0]
      if (!file || file.type !== 'application/json') return

      setFileDetails({
        name: file.name,
        size: file.size / 1000,
      })

      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = async () => {
        const binaryStr = reader.result
        methods.setValue('authentication.mode', 'GCP_JSON_CREDENTIALS', { shouldValidate: true })
        const credentials = binaryStr ? btoa(binaryStr.toString()) : undefined
        methods.setValue('authentication.json_credentials', credentials, { shouldValidate: true })
      }
    },
  })

  const getSubmitPayload = (data: SecretManagerAccess) => {
    const isAutomaticIntegration =
      !isManualOnlyGcpIntegration && !isManualOnlyAwsIntegration && activeTab === 'automatic'
    const isGcpManualIntegration = isManualOnlyGcpIntegration || isGcpManualTabOnGcpSecretManager

    if (isAutomaticIntegration) {
      return {
        ...data,
        authentication: { mode: 'AUTOMATICALLY_CONFIGURED' },
      }
    }

    if (isGcpManualIntegration) {
      return {
        ...data,
        authentication: {
          mode: 'GCP_JSON_CREDENTIALS',
          json_credentials: data.authentication?.json_credentials,
        },
      }
    }

    return data
  }

  const handleSubmit = methods.handleSubmit((data) => {
    onSubmit(getSubmitPayload(data))
    onClose()
  })

  const renderGcpManualIntegrationSections = () => (
    <>
      <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
        <h3 className="text-sm font-medium text-neutral">1. Connect to your GCP Console and create/open a project</h3>
        <p className="text-sm text-neutral-subtle">Make sure you are connected to the right GCP account</p>
        <ExternalLink href="https://console.cloud.google.com/" size="sm">
          https://console.cloud.google.com/
        </ExternalLink>
      </div>
      <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
        <h3 className="text-sm font-medium text-neutral">
          2. Open the embedded Google shell and run the following command
        </h3>
        <div className="flex gap-6 rounded border border-neutral bg-surface-neutral-subtle p-3 text-neutral retina:border-[0.5px]">
          <div>
            <span className="select-none">$ </span>
            curl https://setup.qovery.com/create_credentials_gcp.sh | \ bash -s -- $GOOGLE_CLOUD_PROJECT qovery_role
            qovery-service-account{' '}
          </div>
          <CopyButton content="curl https://setup.qovery.com/create_secret_manager_credentials_gcp.sh | \ bash -s -- $GOOGLE_CLOUD_PROJECT qovery_secrets_manager_role qovery-secrets-manager-sa" />
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
        <h3 className="text-sm font-medium text-neutral">
          3. Download the key.json generated and drag and drop it here
        </h3>
        <Controller
          name="authentication.json_credentials"
          control={methods.control}
          rules={{
            required: 'Please enter your credentials JSON',
          }}
          render={({ field }) => {
            if (!field.value) {
              return (
                <div {...getRootProps()}>
                  <input data-testid="input-credentials-json" className="hidden" {...getInputProps()} />
                  <Dropzone typeFile=".json" isDragActive={isDragActive} />
                </div>
              )
            }

            if (fileDetails) {
              return (
                <div className="flex items-center justify-between rounded border border-neutral p-4">
                  <div className="flex items-center pl-2 text-neutral">
                    <Icon iconName="file-arrow-down" className="mr-4" />
                    <p className="flex flex-col gap-1">
                      <span className="text-xs font-medium">{fileDetails.name}</span>
                      <span className="text-xs text-neutral-subtle">{fileDetails.size} Ko</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    color="neutral"
                    size="md"
                    className="h-7 w-7 justify-center"
                    onClick={() => {
                      field.onChange(undefined)
                      setFileDetails(undefined)
                    }}
                  >
                    <Icon iconName="trash" />
                  </Button>
                </div>
              )
            }

            return <div />
          }}
        />
        <Controller
          name="endpoint.region"
          control={methods.control}
          rules={{
            required: 'Please select a region.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              label="Region"
              value={field.value}
              placeholder="Select a region"
              onChange={(value) => field.onChange(value as string)}
              options={gcpRegions}
              error={error?.message}
              isSearchable
              portal
            />
          )}
        />
        <Controller
          name="name"
          control={methods.control}
          render={({ field }) => (
            <InputText
              name={field.name}
              label="Secret manager name"
              value={field.value}
              onChange={field.onChange}
              hint="Display name in Qovery"
            />
          )}
        />
      </div>
    </>
  )

  const renderAwsCredentialsInstructions = () => (
    <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
      <h3 className="text-sm font-medium text-neutral">1. Create a user for Qovery</h3>
      <p className="text-sm text-neutral-subtle">Follow the instructions available on this page</p>
      <ExternalLink href="https://www.qovery.com/docs/getting-started/installation/aws#create-your-cluster" size="sm">
        How to create new credentials
      </ExternalLink>
    </div>
  )

  const renderAwsRegionField = (syncAuthenticationRegion = false) => (
    <Controller
      name="endpoint.region"
      control={methods.control}
      render={({ field }) => (
        <InputSelect
          label="Region"
          value={field.value}
          placeholder="Select a region"
          onChange={(value) => {
            field.onChange(value as string)

            if (syncAuthenticationRegion) {
              methods.setValue('authentication.region', value as string)
            }
          }}
          options={awsRegions}
          isSearchable
          portal
        />
      )}
    />
  )

  const renderAwsNameField = () => (
    <Controller
      name="name"
      control={methods.control}
      render={({ field }) => (
        <InputText
          name={field.name}
          label="Secret manager name"
          value={field.value}
          onChange={field.onChange}
          hint="Display name in Qovery"
        />
      )}
    />
  )

  const renderAwsStaticCredentialsSections = (syncAuthenticationRegion = false) => (
    <>
      {renderAwsCredentialsInstructions()}
      <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
        <h3 className="text-sm font-medium text-neutral">2. Fill in these information</h3>
        {renderAwsRegionField(syncAuthenticationRegion)}
        <Controller
          name="authentication.access_key"
          control={methods.control}
          render={({ field }) => (
            <InputText name={field.name} label="Access key" value={field.value} onChange={field.onChange} />
          )}
        />
        <Controller
          name="authentication.secret_key"
          control={methods.control}
          render={({ field }) => (
            <InputText
              name={field.name}
              label="Secret access key"
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
        {renderAwsNameField()}
      </div>
    </>
  )

  const renderAwsAuthenticationTypeSelect = () => (
    <Controller
      name="authentication.mode"
      control={methods.control}
      render={({ field }) => {
        const authenticationTypeSelect = (
          <InputSelect
            label="Authentication type"
            value={field.value}
            placeholder="Select an authentication type"
            onChange={(value) => field.onChange(value as string)}
            options={awsManualAuthenticationTypeSelect?.options ?? []}
            disabled={awsManualAuthenticationTypeSelect?.disabled}
            portal
          />
        )

        if (awsManualAuthenticationTypeSelect?.disabled) {
          return (
            <Tooltip content={awsManualAuthenticationTypeSelect.disabledTooltip}>
              <div className="w-full">{authenticationTypeSelect}</div>
            </Tooltip>
          )
        }

        return authenticationTypeSelect
      }}
    />
  )

  const renderAwsAssumeRoleSections = () => {
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
        <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
          <h3 className="text-sm font-medium text-neutral">1. Connect to your AWS Console</h3>
          <p className="text-sm text-neutral-subtle">Make sure you are connected to the right AWS account</p>
          <ExternalLink href="https://aws.amazon.com/fr/console/" size="sm">
            https://aws.amazon.com/fr/console/
          </ExternalLink>
        </div>
        <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
          <h3 className="text-sm font-medium text-neutral">
            2. Create a role for Qovery and grant assume role permissions
          </h3>
          <p className="text-sm text-neutral-subtle">
            Execute the following Cloudformation stack and retrieve the role ARN from the “Output” section.
          </p>
          <ExternalLink href={cloudformationUrl} size="sm">
            Cloudformation stack
          </ExternalLink>
        </div>
        <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
          <h3 className="text-sm font-medium text-neutral">3. Provide your credentials info</h3>
          {renderAwsRegionField()}
          <Controller
            name="authentication.role_arn"
            control={methods.control}
            render={({ field }) => (
              <InputText name={field.name} label="Role ARN" value={field.value} onChange={field.onChange} />
            )}
          />
          {renderAwsNameField()}
        </div>
      </div>
    )
  }

  const renderAwsManualAuthenticationModeSections = () => {
    const authenticationMode = methods.watch('authentication.mode')

    if (!authenticationMode) {
      return (
        <p className="text-sm text-neutral-subtle">Select an authentication type to see the required information.</p>
      )
    }

    if (authenticationMode === 'AWS_STATIC_CREDENTIALS') {
      return renderAwsStaticCredentialsSections(true)
    }

    return renderAwsAssumeRoleSections()
  }

  const renderAwsManualIntegrationSections = () => {
    if (isManualOnlyAwsIntegration) {
      return <div className="flex flex-col gap-4">{renderAwsStaticCredentialsSections()}</div>
    }

    return (
      <div className="flex flex-col gap-4">
        {renderAwsAuthenticationTypeSelect()}
        {renderAwsManualAuthenticationModeSections()}
      </div>
    )
  }

  const renderManualTabSections = () => {
    if (isGcpManualTabOnGcpSecretManager) {
      return <div className="flex flex-col gap-3">{renderGcpManualIntegrationSections()}</div>
    }

    return renderAwsManualIntegrationSections()
  }

  if (isManualOnlyGcpIntegration) {
    return (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-5 pt-5">
            <h2 className="text-lg font-medium text-neutral">{`${option.label} integration`}</h2>
            <p className="mt-1 text-sm text-neutral-subtle">
              {`Link your ${option.icon === 'GCP' ? 'GCP' : 'AWS'} secret manager to use external secrets on all services running on your cluster`}
            </p>
          </div>
          <div className="flex flex-col gap-3 px-5 pb-6 pt-4">{renderGcpManualIntegrationSections()}</div>
          <div className="flex justify-end gap-3 border-t border-neutral px-5 py-4">
            <Button type="button" variant="plain" color="neutral" size="lg" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="lg">
              {mode === 'edit' ? 'Save changes' : 'Add secret manager'}
            </Button>
          </div>
        </form>
      </FormProvider>
    )
  }

  if (isManualOnlyAwsIntegration) {
    return (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-5 pt-5">
            <h2 className="text-lg font-medium text-neutral">{`${option.label} integration`}</h2>
            <p className="mt-1 text-sm text-neutral-subtle">
              {`Link your ${option.icon === 'GCP' ? 'GCP' : 'AWS'} secret manager to use external secrets on all services running on your cluster`}
            </p>
          </div>
          <div className="flex flex-col gap-4 px-5 pb-6 pt-4">{renderAwsManualIntegrationSections()}</div>
          <div className="flex justify-end gap-3 border-t border-neutral px-5 py-4">
            <Button type="button" variant="plain" color="neutral" size="lg" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="lg">
              {mode === 'edit' ? 'Save changes' : 'Add secret manager'}
            </Button>
          </div>
        </form>
      </FormProvider>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="bg-surface-neutral-subtle px-5 pt-5">
          <h2 className="text-lg font-medium text-neutral">{`${option.label} integration`}</h2>
          <p className="mt-1 text-sm text-neutral-subtle">
            {`Link your ${option.icon === 'GCP' ? 'GCP' : 'AWS'} secret manager to use external secrets on all services running on your cluster`}
          </p>
          <div className="-mx-5 mt-4 border-b border-neutral px-5">
            <Navbar.Root activeId={activeTab}>
              {navigation.showAutomaticTabFirst ? (
                <>
                  <Navbar.Item id="automatic" onClick={() => setActiveTab('automatic')}>
                    <Icon iconName="link" iconStyle="regular" />
                    Automatic integration
                  </Navbar.Item>
                  <Navbar.Item id="manual" onClick={() => setActiveTabWithDefaultAuthentication('manual')}>
                    <Icon iconName="hammer" iconStyle="regular" />
                    Manual integration
                  </Navbar.Item>
                </>
              ) : (
                <>
                  <Navbar.Item id="manual" onClick={() => setActiveTabWithDefaultAuthentication('manual')}>
                    <Icon iconName="hammer" iconStyle="regular" />
                    Manual integration
                  </Navbar.Item>
                  <Tooltip content={automaticTab?.disabledTooltip}>
                    <Navbar.Item
                      id="automatic"
                      aria-disabled
                      tabIndex={-1}
                      className="cursor-not-allowed text-neutral-disabled hover:text-neutral-disabled"
                      onClick={(event) => event.preventDefault()}
                    >
                      <Icon iconName="link" iconStyle="regular" />
                      Automatic integration
                    </Navbar.Item>
                  </Tooltip>
                </>
              )}
            </Navbar.Root>
          </div>
        </div>
        <div className="p-5">
          {activeTab === 'automatic' && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-neutral">Automatic integration</p>
                <p className="text-sm text-neutral-subtle">
                  Qovery will use the cluster’s credentials to configure access to your Secrets Manager automatically
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {option.icon === 'GCP' && (
                  <Controller
                    name="endpoint.projectId"
                    control={methods.control}
                    render={({ field }) => (
                      <InputText
                        name={field.name}
                        label="GCP Project ID"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                )}
                <Controller
                  name="endpoint.region"
                  control={methods.control}
                  rules={
                    option.icon === 'GCP'
                      ? {
                          required: 'Please select a region.',
                        }
                      : undefined
                  }
                  render={({ field, fieldState: { error } }) => (
                    <InputSelect
                      label="Region"
                      value={field.value}
                      placeholder="Select a region"
                      onChange={(value) => field.onChange(value as string)}
                      options={regions}
                      error={error?.message}
                      isSearchable
                      portal
                    />
                  )}
                />
                <Controller
                  name="name"
                  control={methods.control}
                  render={({ field }) => (
                    <InputText
                      name={field.name}
                      label="Secret manager name"
                      value={field.value}
                      onChange={field.onChange}
                      hint="Display name in Qovery"
                    />
                  )}
                />
              </div>
              {option.icon === 'AWS' && (
                <Callout.Root color="sky">
                  <Callout.Icon>
                    <Icon iconName="circle-info" iconStyle="regular" />
                  </Callout.Icon>
                  <Callout.Text>
                    Automatic integration requires the secret manager to be in the same AWS account as the cluster
                  </Callout.Text>
                </Callout.Root>
              )}
              {option.icon === 'GCP' && (
                <Callout.Root color="sky">
                  <Callout.Icon>
                    <Icon iconName="circle-info" iconStyle="regular" />
                  </Callout.Icon>
                  <Callout.Text>
                    Automatic integration requires the secret manager to be in the same GCP account as the cluster
                  </Callout.Text>
                </Callout.Root>
              )}
            </div>
          )}

          {activeTab === 'manual' && renderManualTabSections()}
        </div>
        <div className="flex justify-end gap-3 border-t border-neutral px-5 py-4">
          <Button type="button" variant="plain" color="neutral" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            {mode === 'edit' ? 'Save changes' : 'Add secret manager'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
