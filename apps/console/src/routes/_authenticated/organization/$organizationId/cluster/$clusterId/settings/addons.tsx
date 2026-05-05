import { createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type CloudProvider, type ClusterRegion } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { useCloudProviders } from '@qovery/domains/cloud-providers/feature'
import {
  type SecretManagerAssociatedProject,
  SecretManagerAssociatedServicesModal,
  SecretManagerIntegrationModal,
  useCluster,
  useEditCluster,
} from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, Button, DropdownMenu, Icon, IconFlag, Indicator, Section, useModal } from '@qovery/shared/ui'
import { isGCPCluster } from '@qovery/shared/util-clusters'

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

const BASE_SECRET_MANAGERS: SecretManagerItem[] = [
  {
    id: 'secret-manager-prod',
    name: 'Prod secret manager',
    typeLabel: 'AWS Secret manager',
    authentication: 'Automatic',
    provider: 'AWS' as const,
    source: 'aws-manager',
    usedByServices: 32,
    // associatedItems: createSecretManagerAssociatedItems(32),
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

const SECRET_MANAGER_OPTIONS: SecretManagerOption[] = [
  { value: 'aws-manager', label: 'AWS Secret manager', icon: 'AWS', typeLabel: 'AWS Secret manager' },
  { value: 'aws-parameter', label: 'AWS Parameter store', icon: 'AWS', typeLabel: 'AWS Parameter store' },
  { value: 'gcp-secret', label: 'GCP Secret manager', icon: 'GCP', typeLabel: 'GCP Secret manager' },
]

function RouteComponent() {
  const { openModal, closeModal } = useModal()
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const secretManagerEnabled = useFeatureFlagEnabled('secret-manager')
  const { data: cluster } = useCluster({ organizationId, clusterId, suspense: true })
  const { data: cloudProviders = [] } = useCloudProviders({ suspense: true })

  const [kedaEnabled, setKedaEnabled] = useState(cluster?.keda?.enabled ?? false)

  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()

  const secretManagerDropdownOptions = useMemo(() => {
    if (!isGCPCluster(cluster)) {
      return SECRET_MANAGER_OPTIONS
    }

    const gcpOption = SECRET_MANAGER_OPTIONS.find((option) => option.value === 'gcp-secret')
    const awsOptions = SECRET_MANAGER_OPTIONS.filter((option) => option.value !== 'gcp-secret')
    return gcpOption ? [gcpOption, ...awsOptions] : SECRET_MANAGER_OPTIONS
  }, [cluster])

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

  const [secretManagers, setSecretManagers] = useState<SecretManagerItem[]>(() => BASE_SECRET_MANAGERS)
  const hasAwsAutomaticIntegrationConfigured = secretManagers.some(
    (secretManager) => secretManager.provider === 'AWS' && secretManager.authentication === 'Automatic'
  )
  const hasAwsManualStsIntegrationConfigured = secretManagers.some(
    (secretManager) =>
      secretManager.provider === 'AWS' && secretManager.authentication === 'Manual' && secretManager.authType === 'sts'
  )

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

    const updatedCluster = {
      ...cluster,
      keda: {
        enabled: isGCPCluster(cluster) ? false : kedaEnabled,
      },
    }

    try {
      await editCluster({
        organizationId,
        clusterId: cluster.id,
        clusterRequest: updatedCluster,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="p-8">
        <SettingsHeading
          title="Add-ons"
          description="Add-ons are activable options that will grant you access to specific Qovery feature. You can activate or deactivate them when you want."
        />
        <div className="max-w-content-with-navigation-left">
          <div className="divide-y divide-neutral overflow-hidden rounded-lg border border-neutral bg-surface-neutral shadow-[0_0_4px_0_rgba(0,0,0,0.01),0_2px_3px_0_rgba(0,0,0,0.02)]">
            <div className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral">KEDA autoscaler</span>
                    <Badge size="sm" radius="full" variant="surface" color="green" className="text-[13px]">
                      Free
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-subtle">
                    Qovery KEDA autoscaler allows you to add event-based autoscaling on all the services running on this
                    cluster.
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
                </div>
              </div>
            </div>

            {secretManagerEnabled && (
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
                            onSelect={() => {
                              openSecretManagerModal(option)
                            }}
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
                                  onClick={() =>
                                    openSecretManagerModal(getSecretManagerOption(manager.source), manager)
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
            )}
          </div>
          <div className="mt-8">
            <Button type="button" size="lg" onClick={handleSave} loading={isEditClusterLoading}>
              Save
            </Button>
          </div>
        </div>
      </Section>
    </div>
  )
}
