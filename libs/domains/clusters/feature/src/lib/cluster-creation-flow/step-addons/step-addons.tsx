import { type FormEventHandler, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import {
  Badge,
  Button,
  Callout,
  CopyButton,
  DropdownMenu,
  Dropzone,
  ExternalLink,
  FunnelFlowBody,
  Heading,
  Icon,
  IconFlag,
  InputSelect,
  InputText,
  Link,
  Navbar,
  Section,
  useModal,
} from '@qovery/shared/ui'
import { type CloudProvider, type ClusterRegion } from 'qovery-typescript-axios'
import { useCloudProviders } from '@qovery/domains/cloud-providers/feature'
import {
  type ClusterAddonsSecretManager,
  steps,
  useClusterContainerCreateContext,
} from '../cluster-creation-flow'

export interface StepAddonsProps {
  organizationId: string
  onSubmit: () => void
}

interface StepAddonsFormProps {
  onSubmit: () => void
  organizationId: string
  backTo: '/organization/$organizationId/cluster/create/$slug/features'
}

type AddonAction =
  | {
      type: 'toggle'
      label: string
    }
  | {
      type: 'secret-manager'
      label: string
    }

type SecretManagerOption = {
  value: 'aws-manager' | 'aws-parameter' | 'gcp-secret'
  label: string
  icon: 'AWS' | 'GCP'
  typeLabel: string
}

type IntegrationTab = 'automatic' | 'manual'

type SecretManagerIntegrationFormValues = {
  authenticationType: string
  region: string
  roleArn: string
  accessKey: string
  secretAccessKey: string
  secretManagerName: string
}

const SECRET_MANAGER_OPTIONS: SecretManagerOption[] = [
  {
    value: 'aws-manager',
    label: 'AWS Manager type',
    icon: 'AWS',
    typeLabel: 'AWS Manager type',
  },
  {
    value: 'aws-parameter',
    label: 'AWS Parameter store',
    icon: 'AWS',
    typeLabel: 'AWS Parameter store',
  },
  {
    value: 'gcp-secret',
    label: 'GCP Secret manager',
    icon: 'GCP',
    typeLabel: 'GCP Secret manager',
  },
]

const ADDONS: Array<{
  id: string
  title: string
  badge: { label: string; color: 'yellow' | 'green' }
  description: string
  primaryAction: AddonAction
  secondaryAction?: string
}> = [
  {
    id: 'qovery-observe',
    title: 'Qovery Observe',
    badge: { label: '$199/month', color: 'yellow' as const },
    description:
      'Install Prometheus and Loki and your cluster to access Qovery monitoring page. Follow your services usage, create alerts and troubleshoot when any bug occurs.',
    primaryAction: { label: 'Activate', type: 'toggle' },
    secondaryAction: 'More details',
  },
  {
    id: 'keda-autoscaler',
    title: 'KEDA autoscaler',
    badge: { label: 'Free', color: 'green' as const },
    description:
      'Qovery KEDA autoscaler allows you to add event-based autoscaling on all your services running on this cluster.',
    primaryAction: { label: 'Activate', type: 'toggle' },
    secondaryAction: 'More details',
  },
  {
    id: 'secret-manager',
    title: 'Secret manager integration',
    badge: { label: 'Free', color: 'green' as const },
    description:
      'Link any secret manager on your cluster to add external secrets variables to all the services running on your cluster.',
    primaryAction: { label: 'Add secret manager', type: 'secret-manager' },
  },
]

function SecretManagerIntegrationModal({
  option,
  regionOptions,
  clusterProvider,
  mode = 'create',
  initialValues,
  onClose,
  onSubmit,
}: {
  option: SecretManagerOption
  regionOptions: Array<{ label: string; value: string; icon?: JSX.Element }>
  clusterProvider?: string
  mode?: 'create' | 'edit'
  initialValues?: ClusterAddonsSecretManager
  onClose: () => void
  onSubmit: (payload: ClusterAddonsSecretManager) => void
}) {
  const [activeTab, setActiveTab] = useState<IntegrationTab>(
    initialValues?.authentication === 'Manual' ? 'manual' : 'automatic'
  )
  const methods = useForm<SecretManagerIntegrationFormValues>({
    mode: 'onChange',
    defaultValues: {
      authenticationType: initialValues?.authType ?? '',
      region: initialValues?.region ?? '',
      roleArn: initialValues?.roleArn ?? '',
      accessKey: initialValues?.accessKey ?? '',
      secretAccessKey: initialValues?.secretAccessKey ?? '',
      secretManagerName: initialValues?.name ?? '',
    },
  })

  const authenticationOptions = useMemo(
    () => [
      { label: 'Assume role via STS', value: 'sts' },
      { label: 'Static credentials', value: 'static' },
    ],
    []
  )

  const authenticationType = methods.watch('authenticationType')
  const isStaticCredentials = authenticationType === 'static'
  const isAwsCluster = clusterProvider === 'AWS'
  const isGcpSecretManagerOnAws = option.value === 'gcp-secret' && isAwsCluster
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: { 'application/json': ['.json'] },
  })

  useEffect(() => {
    if (activeTab === 'manual' && !authenticationType) {
      methods.setValue('authenticationType', 'sts', { shouldDirty: false })
    }
  }, [activeTab, authenticationType, methods])

  const handleSubmit = methods.handleSubmit((data) => {
    onSubmit({
      id: initialValues?.id ?? `secret-manager-${Date.now()}`,
      name: data.secretManagerName.trim() || 'Secret manager',
      typeLabel: option.typeLabel,
      authentication: activeTab === 'manual' ? 'Manual' : 'Automatic',
      provider: option.icon,
      source: option.value,
      authType:
        activeTab === 'manual' && data.authenticationType
          ? (data.authenticationType as 'sts' | 'static')
          : undefined,
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

  useEffect(() => {
    methods.trigger().then()
  }, [methods.trigger])

  if (isGcpSecretManagerOnAws) {
    return (
      <FormProvider {...methods}>
        <form onSubmit={handleGcpAwsSubmit} className="flex flex-col">
          <div className="px-5 pt-5">
            <h2 className="text-lg font-medium text-neutral">{`${option.label} integration`}</h2>
            <p className="mt-1 text-sm text-neutral-subtle">
              Link your AWS secret manager to use external secrets on all service running on your cluster
            </p>
          </div>
          <div className="flex flex-col gap-3 px-5 pb-6 pt-4">
            <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
              <h3 className="text-sm font-medium text-neutral">
                1. Connect to your GCP Console and create/open a project
              </h3>
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
                  curl https://setup.qovery.com/create_credentials_gcp.sh | \ bash -s -- $GOOGLE_CLOUD_PROJECT
                  qovery_role qovery-service-account{' '}
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="bg-surface-neutral-subtle px-5 pt-5">
          <h2 className="text-lg font-medium text-neutral">{`${option.label} integration`}</h2>
          <p className="mt-1 text-sm text-neutral-subtle">
            {`Link your ${option.icon === 'GCP' ? 'GCP' : 'AWS'} secret manager to use external secrets on all service running on your cluster`}
          </p>
          <div className="mt-4 -mx-5 border-b border-neutral px-5">
            <Navbar.Root activeId={activeTab}>
              <Navbar.Item id="automatic" onClick={() => setActiveTab('automatic')}>
                <Icon iconName="link" iconStyle="regular" />
                Automatic integration
              </Navbar.Item>
              <Navbar.Item id="manual" onClick={() => setActiveTab('manual')}>
                <Icon iconName="hammer" iconStyle="regular" />
                Manual integration
              </Navbar.Item>
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
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="flex flex-col gap-4">
              <Controller
                name="authenticationType"
                control={methods.control}
                  render={({ field }) => (
                    <InputSelect
                      label="Authentication type"
                      value={field.value}
                      placeholder="Select an authentication type"
                      onChange={(value) => field.onChange(value as string)}
                      options={authenticationOptions}
                      portal
                    />
                  )}
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
                        <InputText
                          name={field.name}
                          label="Access key"
                          value={field.value}
                          onChange={field.onChange}
                        />
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
                        <InputText
                          name={field.name}
                          label="Role ARN"
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
                </div>
              ) : null}
            </div>
          )}
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

function StepAddonsForm({ onSubmit, organizationId, backTo }: StepAddonsFormProps) {
  const { openModal, closeModal } = useModal()
  const { generalData, addonsData, setAddonsData } = useClusterContainerCreateContext()
  const { data: cloudProviders = [] } = useCloudProviders()
  const currentProvider = useMemo(
    () => cloudProviders.find((cloud) => cloud.short_name === generalData?.cloud_provider),
    [cloudProviders, generalData?.cloud_provider]
  )
  const regionOptions = useMemo(
    () =>
      (currentProvider as CloudProvider | undefined)?.regions?.map((region: ClusterRegion) => ({
        label: `${region.city} (${region.name})`,
        value: region.name,
        icon: <IconFlag code={region.country_code} />,
      })) || [],
    [currentProvider]
  )
  const [activatedAddons, setActivatedAddons] = useState<Record<string, boolean>>(() => ({
    'qovery-observe': addonsData.observabilityActivated,
    'keda-autoscaler': addonsData.kedaActivated,
  }))
  const [integrations, setIntegrations] = useState<ClusterAddonsSecretManager[]>(() => addonsData.secretManagers)
  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    onSubmit()
  }

  useEffect(() => {
    setAddonsData({
      observabilityActivated: Boolean(activatedAddons['qovery-observe']),
      kedaActivated: Boolean(activatedAddons['keda-autoscaler']),
      secretManagers: integrations,
    })
  }, [activatedAddons, integrations, setAddonsData])

  const getSecretManagerOption = (source: SecretManagerOption['value']) =>
    SECRET_MANAGER_OPTIONS.find((option) => option.value === source) ?? SECRET_MANAGER_OPTIONS[0]

  const openSecretManagerModal = (option: SecretManagerOption, integration?: ClusterAddonsSecretManager) => {
    openModal({
      content: (
        <SecretManagerIntegrationModal
          option={option}
          regionOptions={regionOptions}
          clusterProvider={generalData?.cloud_provider}
          mode={integration ? 'edit' : 'create'}
          initialValues={integration}
          onClose={closeModal}
          onSubmit={(payload) => {
            setIntegrations((prev) => {
              if (integration) {
                return prev.map((item) => (item.id === integration.id ? { ...payload } : item))
              }
              return [...prev, payload]
            })
          }}
        />
      ),
      options: {
        width: 676,
        fakeModal: true,
      },
    })
  }

  return (
    <Section>
      <div className="mb-10 flex flex-col gap-2">
        <Heading>Add-ons</Heading>
        <p className="text-sm text-neutral-subtle">
          Add-ons are activable options that will grant you access to specific Qovery feature. You can activate or
          deactivate them when you want.
        </p>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral shadow-[0_0_4px_0_rgba(0,0,0,0.01),0_2px_3px_0_rgba(0,0,0,0.02)]">
          {ADDONS.map((addon, index) => (
            <div
              key={addon.id}
              className={`flex flex-col gap-3 p-4 ${index < ADDONS.length - 1 ? 'border-b border-neutral' : ''}`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral">{addon.title}</span>
                  <Badge size="sm" radius="full" variant="surface" color={addon.badge.color} className="text-[13px]">
                    {addon.badge.label}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-subtle">{addon.description}</p>
              </div>
              {addon.primaryAction.type === 'toggle' ? (
                <div className="flex items-center gap-2">
                  <Button
                    color="neutral"
                    variant={activatedAddons[addon.id] ? 'outline' : 'solid'}
                    size="md"
                    className="gap-2"
                    type="button"
                    onClick={() =>
                      setActivatedAddons((prev) => ({
                        ...prev,
                        [addon.id]: true,
                      }))
                    }
                  >
                    <Icon iconName="circle-check" iconStyle="regular" className="text-xs" />
                    {activatedAddons[addon.id] ? 'Activated' : addon.primaryAction.label}
                  </Button>
                  {addon.secondaryAction && (
                    <Button type="button" color="neutral" variant="plain" size="md">
                      {addon.secondaryAction}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button color="neutral" variant="solid" size="md" className="gap-2" type="button">
                        <Icon iconName="circle-plus" iconStyle="regular" className="text-xs" />
                        {addon.primaryAction.label}
                        <Icon iconName="chevron-down" className="text-[10px]" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="start">
                      {SECRET_MANAGER_OPTIONS.map((option) => (
                        <DropdownMenu.Item
                          key={option.value}
                          color="neutral"
                          icon={<Icon name={option.icon} width={16} height={16} />}
                          onClick={() => openSecretManagerModal(option)}
                        >
                          {option.label}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                  {integrations.length > 0 && (
                    <div className="w-full rounded-md border border-neutral bg-surface-neutral-subtle">
                      {integrations.map((integration, integrationIndex) => (
                        <div
                          key={integration.id}
                          className={`flex items-center justify-between gap-3 p-3 ${
                            integrationIndex < integrations.length - 1 ? 'border-b border-neutral' : ''
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <Icon name={integration.provider} width={24} height={24} />
                            <div className="flex min-w-0 flex-1 flex-col gap-1 text-[13px] leading-4">
                              <p className="truncate font-medium text-neutral">{integration.name}</p>
                              <div className="flex flex-nowrap items-center gap-2 text-neutral-subtle">
                                <span>
                                  Type: <span className="text-neutral">{integration.typeLabel}</span>
                                </span>
                                <span>
                                  Authentication: <span className="text-neutral">{integration.authentication}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {integration.authentication === 'Manual' && (
                              <Button
                                type="button"
                                variant="outline"
                                color="neutral"
                                size="md"
                                iconOnly
                                onClick={() =>
                                  openSecretManagerModal(getSecretManagerOption(integration.source), integration)
                                }
                              >
                                <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              color="neutral"
                              size="md"
                              iconOnly
                              onClick={() =>
                                setIntegrations((prev) => prev.filter((item) => item.id !== integration.id))
                              }
                            >
                              <Icon iconName="trash" iconStyle="regular" className="text-xs" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <Link
            as="button"
            size="lg"
            type="button"
            variant="plain"
            color="neutral"
            to={backTo}
            params={{ organizationId }}
          >
            Back
          </Link>
          <Button data-testid="button-submit" type="submit" size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export function StepAddons({ organizationId, onSubmit }: StepAddonsProps) {
  const { setCurrentStep, generalData } = useClusterContainerCreateContext()

  useEffect(() => {
    const stepIndex = steps(generalData).findIndex((step) => step.key === 'addons') + 1
    setCurrentStep(stepIndex)
  }, [setCurrentStep, generalData])

  const backTo = '/organization/$organizationId/cluster/create/$slug/features' as const

  return (
    <FunnelFlowBody>
      <StepAddonsForm onSubmit={onSubmit} organizationId={organizationId} backTo={backTo} />
    </FunnelFlowBody>
  )
}

export default StepAddons
