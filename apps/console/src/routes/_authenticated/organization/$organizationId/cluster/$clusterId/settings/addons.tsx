import { createFileRoute, useParams } from '@tanstack/react-router'
import { type CloudProvider, type ClusterRegion, ServiceTypeEnum } from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { useCloudProviders } from '@qovery/domains/cloud-providers/feature'
import {
  type SecretManagerAssociatedProject,
  SecretManagerAssociatedServicesModal,
  SecretManagerIntegrationModal,
  useCluster,
  useEditCluster,
} from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { useUserRole } from '@qovery/shared/iam/feature'
import {
  Badge,
  Button,
  DropdownMenu,
  Icon,
  IconFlag,
  Indicator,
  InputSelect,
  Section,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { type UseCaseOption, useUseCasePage } from '../../../../../../../app/components/use-cases/use-case-context'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/settings/addons')(
  {
    component: RouteComponent,
  }
)

type SecretManagerOption = {
  value: 'aws-manager' | 'aws-parameter' | 'gcp-secret'
  label: string
  icon: 'AWS' | 'GCP'
  typeLabel: string
}

type SecretManagerItem = {
  id: string
  name: string
  typeLabel: string
  authentication: 'Automatic' | 'Manual'
  provider: 'AWS' | 'GCP'
  source: SecretManagerOption['value']
  authType?: 'sts' | 'static'
  region?: string
  roleArn?: string
  accessKey?: string
  secretAccessKey?: string
  usedByServices?: number
  associatedItems?: SecretManagerAssociatedProject[]
}

const SECRET_MANAGER_USE_CASES: UseCaseOption[] = [
  { id: 'delete-no-secrets', label: 'Delete (no secrets)' },
  { id: 'delete-used-no-other', label: 'Delete used (no other)' },
  { id: 'delete-used-one-other', label: 'Delete used (one other)' },
  { id: 'delete-used-multiple-other', label: 'Delete used (multiple other)' },
]

const SECRET_MANAGER_OPTIONS: SecretManagerOption[] = [
  { value: 'aws-manager', label: 'AWS Secret manager', icon: 'AWS', typeLabel: 'AWS Secret manager' },
  { value: 'aws-parameter', label: 'AWS Parameter store', icon: 'AWS', typeLabel: 'AWS Parameter store' },
  { value: 'gcp-secret', label: 'GCP Secret manager', icon: 'GCP', typeLabel: 'GCP Secret manager' },
]

function createSecretManagerAssociatedItems(totalServices: number): SecretManagerAssociatedProject[] {
  const projects = [
    { project_id: 'project-platform', project_name: 'platform' },
    { project_id: 'project-billing', project_name: 'billing' },
    { project_id: 'project-observability', project_name: 'observability' },
  ]
  const environments = [
    { environment_id: 'environment-production', environment_name: 'production' },
    { environment_id: 'environment-staging', environment_name: 'staging' },
    { environment_id: 'environment-development', environment_name: 'development' },
  ]
  const services = ['api', 'worker', 'scheduler', 'ingest', 'web', 'batch', 'cron', 'admin', 'sync', 'processor']
  const serviceTypes = [
    ServiceTypeEnum.APPLICATION,
    ServiceTypeEnum.CONTAINER,
    ServiceTypeEnum.DATABASE,
    ServiceTypeEnum.HELM,
    ServiceTypeEnum.JOB,
    ServiceTypeEnum.TERRAFORM,
  ]

  const flatItems = Array.from({ length: totalServices }, (_, index) => {
    const project = projects[index % projects.length]
    const environment = environments[Math.floor(index / projects.length) % environments.length]
    const serviceName = services[index % services.length]
    const serviceType = serviceTypes[index % serviceTypes.length]

    return {
      project_id: project.project_id,
      project_name: project.project_name,
      environment_id: environment.environment_id,
      environment_name: environment.environment_name,
      service_id: `${project.project_id}-${environment.environment_id}-${serviceName}-${index + 1}`,
      service_name: `${serviceName}-${index + 1}`,
      service_type: serviceType,
    }
  })

  return flatItems.reduce<SecretManagerAssociatedProject[]>((projectsAcc, item) => {
    let project = projectsAcc.find((projectEntry) => projectEntry.project_id === item.project_id)

    if (!project) {
      project = {
        project_id: item.project_id,
        project_name: item.project_name,
        environments: [],
      }
      projectsAcc.push(project)
    }

    let environment = project.environments.find(
      (environmentEntry) => environmentEntry.environment_id === item.environment_id
    )

    if (!environment) {
      environment = {
        environment_id: item.environment_id,
        environment_name: item.environment_name,
        services: [],
      }
      project.environments.push(environment)
    }

    environment.services.push({
      service_id: item.service_id,
      service_name: item.service_name,
      service_type: item.service_type,
    })

    return projectsAcc
  }, [])
}

const BASE_SECRET_MANAGERS: SecretManagerItem[] = [
  {
    id: 'secret-manager-prod',
    name: 'Prod secret manager',
    typeLabel: 'AWS Secret manager',
    authentication: 'Automatic',
    provider: 'AWS' as const,
    source: 'aws-manager',
    usedByServices: 32,
    associatedItems: createSecretManagerAssociatedItems(32),
  },
  {
    id: 'secret-manager-gcp-staging',
    name: 'GCP staging secret manager',
    typeLabel: 'GCP secret manager',
    authentication: 'Manual',
    provider: 'GCP' as const,
    source: 'gcp-secret',
    authType: 'static',
    usedByServices: 0,
  },
  {
    id: 'secret-manager-parameter',
    name: 'AWS Parameter store',
    typeLabel: 'AWS Parameter store',
    authentication: 'Manual',
    provider: 'AWS' as const,
    source: 'aws-parameter',
    authType: 'sts',
    usedByServices: 0,
  },
]

type DeletionAction = 'migrate' | 'detach' | 'convert'

function SecretManagerDeletionHelperModal({
  integration,
  otherManagers,
  onClose,
  onConfirm,
}: {
  integration: SecretManagerItem
  otherManagers: SecretManagerItem[]
  onClose: () => void
  onConfirm: (action: DeletionAction, targetId?: string) => void
}) {
  const [selectedAction, setSelectedAction] = useState<DeletionAction | null>(null)
  const [targetId, setTargetId] = useState('')

  const hasOtherManagers = otherManagers.length > 0
  const hasMultipleManagers = otherManagers.length > 1
  const hasSingleManager = otherManagers.length === 1

  const handleSelect = (action: DeletionAction) => {
    setSelectedAction(action)
    if (action === 'migrate' && hasSingleManager) {
      setTargetId(otherManagers[0]?.id ?? '')
    }
    if (action !== 'migrate') {
      setTargetId('')
    }
  }

  const canFinalize =
    Boolean(selectedAction) && (!hasMultipleManagers || selectedAction !== 'migrate' || Boolean(targetId))

  const cardBase =
    'flex w-full items-center gap-3 rounded-lg bg-background p-3 text-left outline outline-1 focus:outline focus:outline-1 shadow-[0_0_4px_0_rgba(0,0,0,0.01),0_2px_3px_0_rgba(0,0,0,0.02)]'
  const iconBase = 'flex h-10 w-10 items-center justify-center rounded-md'

  return (
    <div className="relative flex flex-col">
      <div className="px-5 pt-5">
        <h2 className="text-lg font-medium text-neutral">Deletion helper</h2>
        <p className="mt-1 text-sm text-neutral-subtle">
          "{integration.name}" is currently used by {integration.usedByServices ?? 0} services. Choose what you want to
          do with the linked external secrets before before deleting it.
        </p>
      </div>
      <div className="flex flex-col gap-2 px-5 py-5">
        {hasOtherManagers && hasMultipleManagers ? (
          <div className="flex flex-col gap-0 rounded-lg border border-neutral bg-surface-neutral-subtle">
            <button
              type="button"
              onClick={() => handleSelect('migrate')}
              className={`${cardBase} ${
                selectedAction === 'migrate'
                  ? 'outline-brand-strong focus:outline-brand-strong'
                  : 'outline-neutral focus:outline-neutral'
              }`}
            >
              <div
                className={`${iconBase} ${
                  selectedAction === 'migrate'
                    ? 'bg-surface-brand-component text-brand'
                    : 'bg-surface-neutral-component'
                }`}
              >
                <Icon iconName="right-left" className={selectedAction === 'migrate' ? 'text-brand' : undefined} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-neutral">Migrate to another secret manager</span>
                <span className="text-xs text-neutral-subtle">
                  Migration to one of your other secret manager detected
                </span>
              </div>
            </button>
            {selectedAction === 'migrate' && (
              <div className="p-3">
                <InputSelect
                  label="Target secret manager"
                  placeholder="Select a secret manager"
                  value={targetId}
                  onChange={(value) => setTargetId(value as string)}
                  options={otherManagers.map((manager) => ({ label: manager.name, value: manager.id }))}
                  portal
                />
              </div>
            )}
          </div>
        ) : (
          hasOtherManagers && (
            <button
              type="button"
              onClick={() => handleSelect('migrate')}
              className={`${cardBase} ${
                selectedAction === 'migrate'
                  ? 'outline-brand-strong focus:outline-brand-strong'
                  : 'outline-neutral focus:outline-neutral'
              }`}
            >
              <div
                className={`${iconBase} ${
                  selectedAction === 'migrate'
                    ? 'bg-surface-brand-component text-brand'
                    : 'bg-surface-neutral-component'
                }`}
              >
                <Icon iconName="right-left" className={selectedAction === 'migrate' ? 'text-brand' : undefined} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-neutral">Migrate to detected secret manager</span>
                <span className="text-xs text-neutral-subtle">References will point to "{otherManagers[0]?.name}"</span>
              </div>
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => handleSelect('detach')}
          className={`${cardBase} ${
            selectedAction === 'detach'
              ? 'outline-brand-strong focus:outline-brand-strong'
              : 'outline-neutral focus:outline-neutral'
          }`}
        >
          <div
            className={`${iconBase} ${
              selectedAction === 'detach' ? 'bg-surface-brand-component text-brand' : 'bg-surface-neutral-component'
            }`}
          >
            <Icon iconName="link-broken" className={selectedAction === 'detach' ? 'text-brand' : undefined} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral">Detach all references</span>
            <span className="text-xs text-neutral-subtle">Empty external secrets to be remapped later</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('convert')}
          className={`${cardBase} ${
            selectedAction === 'convert'
              ? 'outline-brand-strong focus:outline-brand-strong'
              : 'outline-neutral focus:outline-neutral'
          }`}
        >
          <div
            className={`${iconBase} ${
              selectedAction === 'convert' ? 'bg-surface-brand-component text-brand' : 'bg-surface-neutral-component'
            }`}
          >
            <Icon iconName="lock-keyhole" className={selectedAction === 'convert' ? 'text-brand' : undefined} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral">Convert to empty Qovery secrets</span>
            <span className="text-xs text-neutral-subtle">Conversion to empty qovery secrets for manual migration</span>
          </div>
        </button>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-neutral px-5 py-4">
        <Button type="button" variant="plain" color="neutral" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={!canFinalize}
          onClick={() => selectedAction && onConfirm(selectedAction, targetId)}
        >
          Finalize deletion
        </Button>
      </div>
    </div>
  )
}

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()
  const { isQoveryAdminUser } = useUserRole()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: cloudProviders = [] } = useCloudProviders()
  const { selectedCaseId } = useUseCasePage({
    pageId: 'cluster-settings-addons-secret-manager',
    options: SECRET_MANAGER_USE_CASES,
    defaultCaseId: 'delete-no-secrets',
  })
  const currentProvider = useMemo(
    () => cloudProviders.find((cloud) => cloud.short_name === cluster?.cloud_provider),
    [cloudProviders, cluster?.cloud_provider]
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
  const [observabilityEnabled, setObservabilityEnabled] = useState(false)
  const [kedaEnabled, setKedaEnabled] = useState(false)
  const isGcpCluster = cluster?.cloud_provider === 'GCP'
  const baseSecretManagers = useMemo(
    () =>
      match(selectedCaseId)
        .with('delete-no-secrets', () =>
          BASE_SECRET_MANAGERS.slice(0, 2).map((manager) => ({ ...manager, usedByServices: 0 }))
        )
        .with('delete-used-no-other', () => [{ ...BASE_SECRET_MANAGERS[0], usedByServices: 32 }])
        .with('delete-used-one-other', () => [
          { ...BASE_SECRET_MANAGERS[0], usedByServices: 32 },
          { ...BASE_SECRET_MANAGERS[1], usedByServices: 0 },
        ])
        .with('delete-used-multiple-other', () => [
          { ...BASE_SECRET_MANAGERS[0], usedByServices: 32 },
          { ...BASE_SECRET_MANAGERS[1], usedByServices: 0 },
          { ...BASE_SECRET_MANAGERS[2], usedByServices: 0 },
        ])
        .otherwise(() => BASE_SECRET_MANAGERS.slice(0, 2)),
    [selectedCaseId]
  )
  const [secretManagers, setSecretManagers] = useState<SecretManagerItem[]>(() => baseSecretManagers)
  const secretManagerDropdownOptions = useMemo(() => {
    if (cluster?.cloud_provider !== 'GCP') {
      return SECRET_MANAGER_OPTIONS
    }

    const gcpOption = SECRET_MANAGER_OPTIONS.find((option) => option.value === 'gcp-secret')
    const awsOptions = SECRET_MANAGER_OPTIONS.filter((option) => option.value !== 'gcp-secret')
    return gcpOption ? [gcpOption, ...awsOptions] : SECRET_MANAGER_OPTIONS
  }, [cluster?.cloud_provider])
  const hasAwsAutomaticIntegrationConfigured = secretManagers.some(
    (secretManager) => secretManager.provider === 'AWS' && secretManager.authentication === 'Automatic'
  )
  const hasAwsManualStsIntegrationConfigured = secretManagers.some(
    (secretManager) =>
      secretManager.provider === 'AWS' && secretManager.authentication === 'Manual' && secretManager.authType === 'sts'
  )
  useEffect(() => {
    if (cluster) {
      setObservabilityEnabled(Boolean(cluster.metrics_parameters?.enabled))
      setKedaEnabled(Boolean(cluster.keda?.enabled))
    }
  }, [cluster])

  useEffect(() => {
    setSecretManagers(baseSecretManagers)
  }, [baseSecretManagers])

  const getSecretManagerOption = (source: SecretManagerOption['value']) =>
    SECRET_MANAGER_OPTIONS.find((option) => option.value === source) ?? SECRET_MANAGER_OPTIONS[0]

  const openSecretManagerModal = (option: SecretManagerOption, integration?: SecretManagerItem) => {
    openModal({
      content: (
        <SecretManagerIntegrationModal
          option={option}
          regionOptions={regionOptions}
          clusterProvider={cluster?.cloud_provider}
          hasAwsAutomaticIntegrationConfigured={hasAwsAutomaticIntegrationConfigured}
          hasAwsManualStsIntegrationConfigured={hasAwsManualStsIntegrationConfigured}
          mode={integration ? 'edit' : 'create'}
          initialValues={integration}
          onClose={closeModal}
          onSubmit={(payload) => {
            setSecretManagers((prev) => {
              if (integration) {
                return prev.map((item) =>
                  item.id === integration.id
                    ? {
                        ...payload,
                        usedByServices: integration.usedByServices ?? 0,
                        associatedItems: integration.associatedItems,
                      }
                    : item
                )
              }
              return [...prev, { ...payload, usedByServices: 0 }]
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

  const openSecretManagerAssociatedServicesModal = (integration: SecretManagerItem) => {
    openModal({
      content: (
        <SecretManagerAssociatedServicesModal
          associatedItems={integration.associatedItems ?? []}
          organizationId={organizationId}
          title="Associated services"
          description={`${integration.name} is referenced by the following environments and services.`}
          onClose={closeModal}
        />
      ),
      options: {
        fakeModal: true,
      },
    })
  }

  const handleSave = async () => {
    if (!cluster) return

    const cloneCluster = {
      ...cluster,
      keda: {
        enabled: isGcpCluster ? false : kedaEnabled,
      },
    }

    if (isQoveryAdminUser) {
      if (observabilityEnabled) {
        cloneCluster.metrics_parameters = {
          enabled: observabilityEnabled,
          configuration: {
            kind: 'MANAGED_BY_QOVERY',
            resource_profile: cloneCluster.metrics_parameters?.configuration?.resource_profile,
            cloud_watch_export_config: {
              ...cloneCluster.metrics_parameters?.configuration?.cloud_watch_export_config,
              enabled: cloneCluster.metrics_parameters?.configuration?.cloud_watch_export_config?.enabled ?? false,
            },
            high_availability: cloneCluster.metrics_parameters?.configuration?.high_availability,
            internal_network_monitoring: cloneCluster.metrics_parameters?.configuration?.internal_network_monitoring,
            alerting: {
              ...cloneCluster.metrics_parameters?.configuration?.alerting,
              enabled: cloneCluster.metrics_parameters?.configuration?.alerting?.enabled ?? false,
            },
          },
        }
      } else {
        cloneCluster.metrics_parameters = {
          enabled: false,
        }
      }
    }

    try {
      await editCluster({
        organizationId,
        clusterId: cluster.id,
        clusterRequest: cloneCluster,
      })
    } catch (error) {
      console.error(error)
    }
  }

  if (!cluster) {
    return null
  }

  const openDeletionHelper = (integration: SecretManagerItem) => {
    const otherManagers = secretManagers.filter((item) => item.id !== integration.id)
    openModal({
      content: (
        <SecretManagerDeletionHelperModal
          integration={integration}
          otherManagers={otherManagers}
          onClose={closeModal}
          onConfirm={() => {
            setSecretManagers((prev) => prev.filter((item) => item.id !== integration.id))
            closeModal()
          }}
        />
      ),
      options: {
        width: 488,
        fakeModal: true,
      },
    })
  }

  const handleDeleteSecretManager = (integration: SecretManagerItem) => {
    openModalConfirmation({
      title: 'Delete secret manager',
      name: integration.name,
      confirmationMethod: 'action',
      confirmationAction: 'delete',
      action: () => {
        const hasSecrets = (integration.usedByServices ?? 0) > 0
        if (hasSecrets) {
          openDeletionHelper(integration)
        } else {
          setSecretManagers((prev) => prev.filter((item) => item.id !== integration.id))
        }
      },
    })
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="p-8">
        <SettingsHeading
          title="Add-ons"
          description="Add-ons are activable options that will grant you access to specific Qovery feature. You can activate or deactivate them when you want."
        />
        <div className="max-w-content-with-navigation-left">
          <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral shadow-[0_0_4px_0_rgba(0,0,0,0.01),0_2px_3px_0_rgba(0,0,0,0.02)]">
            <div className="border-b border-neutral p-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral">Qovery Observe</span>
                    <Badge size="sm" radius="full" variant="surface" color="yellow" className="text-[13px]">
                      $199/month
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-subtle">
                    Install Prometheus and Loki and your cluster to access Qovery monitoring page. Follow your services
                    usage, create alerts and troubleshoot when any bug occurs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    color="neutral"
                    variant={observabilityEnabled ? 'surface' : 'outline'}
                    size="md"
                    className="gap-2"
                    onClick={() => setObservabilityEnabled((prev) => !prev)}
                  >
                    <Icon iconName="circle-check" iconStyle="regular" className="text-xs" />
                    {observabilityEnabled ? 'Activated' : 'Activate'}
                  </Button>
                  <Button type="button" color="neutral" variant="plain" size="md">
                    More details
                  </Button>
                </div>
              </div>
            </div>
            {!isGcpCluster && (
              <div className="border-b border-neutral p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral">KEDA autoscaler</span>
                      <Badge size="sm" radius="full" variant="surface" color="green" className="text-[13px]">
                        Free
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-subtle">
                      Qovery KEDA autoscaler allows you to add event-based autoscaling on all the services running on
                      this cluster.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      color="neutral"
                      variant={kedaEnabled ? 'surface' : 'outline'}
                      size="md"
                      className="gap-2"
                      onClick={() => setKedaEnabled((prev) => !prev)}
                    >
                      <Icon iconName="circle-check" iconStyle="regular" className="text-xs" />
                      {kedaEnabled ? 'Activated' : 'Activate'}
                    </Button>
                    <Button type="button" color="neutral" variant="plain" size="md">
                      More details
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral">Secret manager integration</span>
                    <Badge size="sm" radius="full" variant="surface" color="green" className="text-[13px]">
                      Free
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-subtle">
                    Link any secret manager on your cluster to add external secrets variables to all the services
                    running on your cluster
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button color="neutral" variant="solid" size="md" className="gap-2" type="button">
                        <Icon iconName="circle-plus" iconStyle="regular" className="text-xs" />
                        Add secret manager
                        <Icon iconName="chevron-down" className="text-[10px]" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="start">
                      {secretManagerDropdownOptions.map((option) => (
                        <DropdownMenu.Item
                          key={option.value}
                          color="neutral"
                          icon={<Icon name={option.icon} width={16} height={16} />}
                          onSelect={() => openSecretManagerModal(option)}
                        >
                          {option.label}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                  {secretManagers.length > 0 && (
                    <div className="w-full rounded-md border border-neutral bg-surface-neutral-subtle">
                      {secretManagers.map((manager, index) => (
                        <div
                          key={manager.id}
                          className={`flex items-center justify-between gap-3 p-3 ${
                            index < secretManagers.length - 1 ? 'border-b border-neutral' : ''
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <Icon name={manager.provider} width={24} height={24} />
                            <div className="flex min-w-0 flex-1 flex-col gap-1 text-[13px] leading-4">
                              <p className="truncate font-medium text-neutral">{manager.name}</p>
                              <div className="flex flex-nowrap items-center gap-2 text-neutral-subtle">
                                <span>
                                  Type: <span className="text-neutral">{manager.typeLabel}</span>
                                </span>
                                <span>
                                  Authentication: <span className="text-neutral">{manager.authentication}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Indicator
                              content={
                                <span className="relative right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-surface-brand-solid text-3xs font-bold leading-[0] text-neutralInvert">
                                  {manager.usedByServices ?? 0}
                                </span>
                              }
                            >
                              <Button
                                type="button"
                                variant="outline"
                                color="neutral"
                                size="md"
                                iconOnly
                                className="relative"
                                disabled={(manager.usedByServices ?? 0) === 0}
                                onClick={() => openSecretManagerAssociatedServicesModal(manager)}
                              >
                                <Icon iconName="layer-group" iconStyle="regular" />
                              </Button>
                            </Indicator>
                            {manager.authentication !== 'Automatic' && (
                              <Button
                                type="button"
                                variant="outline"
                                color="neutral"
                                size="md"
                                iconOnly
                                onClick={() => openSecretManagerModal(getSecretManagerOption(manager.source), manager)}
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
                              onClick={() => handleDeleteSecretManager(manager)}
                            >
                              <Icon iconName="trash" iconStyle="regular" className="text-xs" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Button type="button" size="lg" onClick={handleSave} loading={isEditClusterLoading}>
              Save changes
            </Button>
          </div>
        </div>
      </Section>
    </div>
  )
}
