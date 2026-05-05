import { useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import {
  Button,
  Callout,
  CopyButton,
  Dropzone,
  ExternalLink,
  Icon,
  InputSelect,
  InputText,
  Navbar,
  Tooltip,
} from '@qovery/shared/ui'
import { type ClusterAddonsSecretManager } from '../cluster-creation-flow/cluster-creation-flow'

export type SecretManagerOption = {
  value: 'aws-manager' | 'aws-parameter' | 'gcp-secret'
  label: string
  icon: 'AWS' | 'GCP'
  typeLabel: string
}

type IntegrationTab = 'automatic' | 'manual'

type SecretManagerIntegrationFormValues = {
  authenticationType: string
  gcpProjectId: string
  region: string
  roleArn: string
  accessKey: string
  secretAccessKey: string
  secretManagerName: string
}

const AUTOMATIC_INTEGRATION_DISABLED_TOOLTIP =
  'Automatic integration is unavailable because an STS manual integration is already configured.'

export interface SecretManagerIntegrationModalProps {
  option: SecretManagerOption
  regionOptions: Array<{ label: string; value: string; icon?: JSX.Element }>
  clusterProvider?: string
  hasAwsAutomaticIntegrationConfigured?: boolean
  hasAwsManualStsIntegrationConfigured?: boolean
  mode?: 'create' | 'edit'
  initialValues?: ClusterAddonsSecretManager
  onClose: () => void
  onSubmit: (payload: ClusterAddonsSecretManager) => void
}

export function SecretManagerIntegrationModal({
  option,
  regionOptions,
  clusterProvider,
  hasAwsAutomaticIntegrationConfigured = false,
  hasAwsManualStsIntegrationConfigured = false,
  mode = 'create',
  initialValues,
  onClose,
  onSubmit,
}: SecretManagerIntegrationModalProps) {
  const isAwsCluster = clusterProvider === 'AWS'
  const isAwsIntegration = option.icon === 'AWS'
  const hasConfiguredAwsAutomaticIntegration = isAwsCluster && isAwsIntegration && hasAwsAutomaticIntegrationConfigured
  const hasConfiguredAwsManualStsIntegration = isAwsCluster && isAwsIntegration && hasAwsManualStsIntegrationConfigured
  const blockedAwsIntegrationLabel = hasConfiguredAwsAutomaticIntegration
    ? 'Automatic'
    : hasConfiguredAwsManualStsIntegration
      ? 'Assume role'
      : undefined
  const isEditingAwsManualStsIntegration =
    mode === 'edit' && initialValues?.authentication === 'Manual' && initialValues?.authType === 'sts'
  const shouldForceStaticCredentials = Boolean(blockedAwsIntegrationLabel) && !isEditingAwsManualStsIntegration
  const shouldForceStsCredentials = isEditingAwsManualStsIntegration
  const showAutomaticTabFirst = !blockedAwsIntegrationLabel
  const disabledIntegrationTooltip =
    shouldForceStaticCredentials && blockedAwsIntegrationLabel
      ? `Static credentials are the only available option while ${blockedAwsIntegrationLabel} integration is configured`
      : AUTOMATIC_INTEGRATION_DISABLED_TOOLTIP

  const [activeTab, setActiveTab] = useState<IntegrationTab>(() =>
    initialValues?.authentication === 'Manual' || Boolean(blockedAwsIntegrationLabel) ? 'manual' : 'automatic'
  )
  const methods = useForm<SecretManagerIntegrationFormValues>({
    mode: 'onChange',
    defaultValues: {
      authenticationType: initialValues?.authType ?? '',
      gcpProjectId: initialValues?.gcpProjectId ?? '',
      region: initialValues?.region ?? '',
      roleArn: initialValues?.roleArn ?? '',
      accessKey: initialValues?.accessKey ?? '',
      secretAccessKey: initialValues?.secretAccessKey ?? '',
      secretManagerName: initialValues?.name ?? '',
    },
  })

  const authenticationOptions = useMemo(
    () =>
      shouldForceStaticCredentials
        ? [{ label: 'Static credentials', value: 'static' }]
        : [
            { label: 'Assume role via STS', value: 'sts' },
            { label: 'Static credentials', value: 'static' },
          ],
    [shouldForceStaticCredentials]
  )

  const authenticationType = methods.watch('authenticationType')
  const isStaticCredentials = authenticationType === 'static'
  const isGcpCluster = clusterProvider === 'GCP'
  const isGcpSecretManagerOnAws = option.value === 'gcp-secret' && isAwsCluster
  const isAwsSecretManagerOnGcp = option.icon === 'AWS' && isGcpCluster
  const isManualOnlyGcpIntegration = isGcpSecretManagerOnAws
  const isManualOnlyAwsIntegration = isAwsSecretManagerOnGcp
  const isGcpManualTabOnGcpSecretManager = option.value === 'gcp-secret' && isGcpCluster && activeTab === 'manual'
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: { 'application/json': ['.json'] },
  })

  useEffect(() => {
    if (shouldForceStaticCredentials) {
      methods.setValue('authenticationType', 'static', { shouldDirty: false })
      return
    }

    if (shouldForceStsCredentials) {
      methods.setValue('authenticationType', 'sts', { shouldDirty: false })
      return
    }

    if (
      (activeTab === 'manual' || isManualOnlyAwsIntegration) &&
      !authenticationType &&
      !(isGcpCluster && option.value === 'gcp-secret')
    ) {
      methods.setValue('authenticationType', isManualOnlyAwsIntegration ? 'static' : 'sts', { shouldDirty: false })
    }
  }, [
    activeTab,
    authenticationType,
    isGcpCluster,
    isManualOnlyAwsIntegration,
    methods,
    option.value,
    shouldForceStsCredentials,
    shouldForceStaticCredentials,
  ])

  const handleSubmit = methods.handleSubmit((data) => {
    const useGcpManualPayload = activeTab === 'manual' && isGcpCluster && option.value === 'gcp-secret'
    onSubmit({
      id: initialValues?.id ?? `secret-manager-${Date.now()}`,
      name: data.secretManagerName.trim() || 'Secret manager',
      typeLabel: option.typeLabel,
      authentication: activeTab === 'manual' ? 'Manual' : 'Automatic',
      provider: option.icon,
      source: option.value,
      authType: useGcpManualPayload
        ? 'static'
        : activeTab === 'manual' && data.authenticationType
          ? (data.authenticationType as 'sts' | 'static')
          : undefined,
      gcpProjectId: data.gcpProjectId || undefined,
      region: data.region || undefined,
      roleArn: data.roleArn || undefined,
      accessKey: data.accessKey || undefined,
      secretAccessKey: data.secretAccessKey || undefined,
    })
    onClose()
  })

  const handleGcpAwsSubmit = methods.handleSubmit((data) => {
    onSubmit({
      id: initialValues?.id ?? `secret-manager-${Date.now()}`,
      name: data.secretManagerName.trim() || 'Secret manager',
      typeLabel: option.typeLabel,
      authentication: 'Manual',
      provider: option.icon,
      source: option.value,
      authType: 'static',
    })
    onClose()
  })

  const handleAwsManualOnlySubmit = methods.handleSubmit((data) => {
    onSubmit({
      id: initialValues?.id ?? `secret-manager-${Date.now()}`,
      name: data.secretManagerName.trim() || 'Secret manager',
      typeLabel: option.typeLabel,
      authentication: 'Manual',
      provider: option.icon,
      source: option.value,
      authType: 'static',
      region: data.region || undefined,
      roleArn: undefined,
      accessKey: data.accessKey || undefined,
      secretAccessKey: data.secretAccessKey || undefined,
    })
    onClose()
  })

  useEffect(() => {
    methods.trigger().then()
  }, [methods])

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
          <CopyButton
            content=" curl https://setup.qovery.com/create_credentials_gcp.sh | \
bash -s -- $GOOGLE_CLOUD_PROJECT qovery_role qovery-service-account"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
        <h3 className="text-sm font-medium text-neutral">
          3. Download the key.json generated and drag and drop it here
        </h3>
        <div {...getRootProps()}>
          <input className="hidden" {...getInputProps()} />
          <Dropzone typeFile=".json" isDragActive={isDragActive} />
        </div>
        <Controller
          name="secretManagerName"
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

  const renderAwsManualIntegrationSections = () => (
    <div className="flex flex-col gap-4">
      {isManualOnlyAwsIntegration ? (
        <>
          <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
            <h3 className="text-sm font-medium text-neutral">1. Create a user for Qovery</h3>
            <p className="text-sm text-neutral-subtle">Follow the instructions available on this page</p>
            <ExternalLink
              href="https://www.qovery.com/docs/getting-started/installation/aws#create-your-cluster"
              size="sm"
            >
              How to create new credentials
            </ExternalLink>
          </div>
          <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
            <h3 className="text-sm font-medium text-neutral">2. Fill in these information</h3>
            <Controller
              name="region"
              control={methods.control}
              render={({ field }) => (
                <InputSelect
                  label="Region"
                  value={field.value}
                  placeholder="Select a region"
                  onChange={(value) => field.onChange(value as string)}
                  options={regionOptions}
                  isSearchable
                  portal
                />
              )}
            />
            <Controller
              name="accessKey"
              control={methods.control}
              render={({ field }) => (
                <InputText name={field.name} label="Access key" value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="secretAccessKey"
              control={methods.control}
              render={({ field }) => (
                <InputText name={field.name} label="Secret access key" value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="secretManagerName"
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
      ) : (
        <>
          <Controller
            name="authenticationType"
            control={methods.control}
            render={({ field }) => {
              const authenticationTypeSelect = (
                <InputSelect
                  label="Authentication type"
                  value={field.value}
                  placeholder="Select an authentication type"
                  onChange={(value) => field.onChange(value as string)}
                  options={authenticationOptions}
                  disabled={shouldForceStaticCredentials}
                  portal
                />
              )

              if (shouldForceStaticCredentials) {
                return (
                  <Tooltip content={disabledIntegrationTooltip}>
                    <div className="w-full">{authenticationTypeSelect}</div>
                  </Tooltip>
                )
              }

              return authenticationTypeSelect
            }}
          />

          {!authenticationType && (
            <p className="text-sm text-neutral-subtle">
              Select an authentication type to see the required information.
            </p>
          )}
          {authenticationType && isStaticCredentials ? (
            <>
              <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                <h3 className="text-sm font-medium text-neutral">1. Create a user for Qovery</h3>
                <p className="text-sm text-neutral-subtle">Follow the instructions available on this page</p>
                <ExternalLink
                  href="https://www.qovery.com/docs/getting-started/installation/aws#create-your-cluster"
                  size="sm"
                >
                  How to create new credentials
                </ExternalLink>
              </div>
              <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
                <h3 className="text-sm font-medium text-neutral">2. Fill in these information</h3>
                <Controller
                  name="region"
                  control={methods.control}
                  render={({ field }) => (
                    <InputSelect
                      label="Region"
                      value={field.value}
                      placeholder="Select a region"
                      onChange={(value) => field.onChange(value as string)}
                      options={regionOptions}
                      isSearchable
                      portal
                    />
                  )}
                />
                <Controller
                  name="accessKey"
                  control={methods.control}
                  render={({ field }) => (
                    <InputText name={field.name} label="Access key" value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  name="secretAccessKey"
                  control={methods.control}
                  render={({ field }) => (
                    <InputText
                      name={field.name}
                      label="Secret access key"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="secretManagerName"
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
          ) : authenticationType ? (
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
                <ExternalLink
                  href="https://console.aws.amazon.com/cloudformation/home?#/stacks/quickcreate?templateURL=https%3A%2F%2Fs3.amazonaws.com%2Fcloudformation-qovery-role-creation%2Ftemplate.json&stackName=qovery-role-creation"
                  size="sm"
                >
                  Cloudformation stack
                </ExternalLink>
              </div>
              <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
                <h3 className="text-sm font-medium text-neutral">3. Provide your credentials info</h3>
                <Controller
                  name="region"
                  control={methods.control}
                  render={({ field }) => (
                    <InputSelect
                      label="Region"
                      value={field.value}
                      placeholder="Select a region"
                      onChange={(value) => field.onChange(value as string)}
                      options={regionOptions}
                      isSearchable
                      portal
                    />
                  )}
                />
                <Controller
                  name="roleArn"
                  control={methods.control}
                  render={({ field }) => (
                    <InputText name={field.name} label="Role ARN" value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  name="secretManagerName"
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
            </div>
          ) : null}
        </>
      )}
    </div>
  )

  if (isManualOnlyGcpIntegration) {
    return (
      <FormProvider {...methods}>
        <form onSubmit={handleGcpAwsSubmit} className="flex flex-col">
          <div className="px-5 pt-5">
            <h2 className="text-lg font-medium text-neutral">{`${option.label} integration`}</h2>
            <p className="mt-1 text-sm text-neutral-subtle">
              {`Link your ${option.icon === 'GCP' ? 'GCP' : 'AWS'} secret manager to use external secrets on all service running on your cluster`}
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
        <form onSubmit={handleAwsManualOnlySubmit} className="flex flex-col">
          <div className="px-5 pt-5">
            <h2 className="text-lg font-medium text-neutral">{`${option.label} integration`}</h2>
            <p className="mt-1 text-sm text-neutral-subtle">
              {`Link your ${option.icon === 'GCP' ? 'GCP' : 'AWS'} secret manager to use external secrets on all service running on your cluster`}
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
            {`Link your ${option.icon === 'GCP' ? 'GCP' : 'AWS'} secret manager to use external secrets on all service running on your cluster`}
          </p>
          <div className="-mx-5 mt-4 border-b border-neutral px-5">
            <Navbar.Root activeId={activeTab}>
              {showAutomaticTabFirst ? (
                <>
                  <Navbar.Item id="automatic" onClick={() => setActiveTab('automatic')}>
                    <Icon iconName="link" iconStyle="regular" />
                    Automatic integration
                  </Navbar.Item>
                  <Navbar.Item id="manual" onClick={() => setActiveTab('manual')}>
                    <Icon iconName="hammer" iconStyle="regular" />
                    Manual integration
                  </Navbar.Item>
                </>
              ) : (
                <>
                  <Navbar.Item id="manual" onClick={() => setActiveTab('manual')}>
                    <Icon iconName="hammer" iconStyle="regular" />
                    Manual integration
                  </Navbar.Item>
                  <Tooltip content={disabledIntegrationTooltip}>
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
                    name="gcpProjectId"
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
                  name="region"
                  control={methods.control}
                  render={({ field }) => (
                    <InputSelect
                      label="Region"
                      value={field.value}
                      placeholder="Select a region"
                      onChange={(value) => field.onChange(value as string)}
                      options={regionOptions}
                      isSearchable
                      portal
                    />
                  )}
                />
                <Controller
                  name="secretManagerName"
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

          {activeTab === 'manual' &&
            (isGcpManualTabOnGcpSecretManager ? (
              <div className="flex flex-col gap-3">{renderGcpManualIntegrationSections()}</div>
            ) : (
              renderAwsManualIntegrationSections()
            ))}
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
