import { createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import {
  AddonToggleCard,
  SECRET_MANAGER_OPTIONS,
  SecretManagerIntegrationModal,
  SecretManagerList,
  getSecretManagerOption,
  useCluster,
  useEditCluster,
  useSecretManagerAssociatedServices,
} from '@qovery/domains/clusters/feature'
import { type AssociatedItem, AssociatedItemsModal } from '@qovery/domains/organizations/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, Button, DropdownMenu, Icon, Section, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { isGcpCluster } from '@qovery/shared/util-clusters'
import { pluralize } from '@qovery/shared/util-js'

function SecretManagerAssociatedItemsContent({
  secretManagerAccessId,
  organizationId,
  integrationName,
  onClose,
}: {
  secretManagerAccessId: string
  organizationId: string
  integrationName: string
  onClose: () => void
}) {
  const { data: associatedServices = [], isLoading } = useSecretManagerAssociatedServices({
    secretManagerAccessId,
  })

  const items: AssociatedItem[] = associatedServices
    .filter((s) => s.service_id && s.service_name && s.service_type)
    .map((s) => ({
      project_id: s.project_id,
      project_name: s.project_name,
      environment_id: s.environment_id,
      environment_name: s.environment_name,
      item_id: s.service_id!,
      item_name: s.service_name!,
      item_type: s.service_type!,
    }))

  return (
    <AssociatedItemsModal
      title={`Associated ${pluralize(items.length, 'service')}`}
      organizationId={organizationId}
      items={items}
      isLoading={isLoading}
      onClose={onClose}
    />
  )
}

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/settings/addons')(
  {
    component: RouteComponent,
  }
)

function RouteComponent() {
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const secretManagerEnabled = useFeatureFlagEnabled('secret-manager')
  const { data: cluster } = useCluster({ organizationId, clusterId, suspense: true })

  const [kedaEnabled, setKedaEnabled] = useState(cluster?.keda?.enabled ?? false)

  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()

  const secretManagerDropdownOptions = useMemo(() => {
    if (!isGcpCluster(cluster)) {
      return SECRET_MANAGER_OPTIONS
    }

    const gcpOption = SECRET_MANAGER_OPTIONS.find((option) => option.value === 'GCP_SECRET_MANAGER')
    const awsOptions = SECRET_MANAGER_OPTIONS.filter((option) => option.value !== 'GCP_SECRET_MANAGER')
    return gcpOption ? [gcpOption, ...awsOptions] : SECRET_MANAGER_OPTIONS
  }, [cluster])

  const [secretManagers, setSecretManagers] = useState<SecretManagerAccess[]>(
    () => cluster?.secret_manager_accesses ?? []
  )

  const openSecretManagerModal = (
    option: (typeof SECRET_MANAGER_OPTIONS)[number],
    secretManager?: SecretManagerAccess
  ) => {
    openModal({
      content: (
        <SecretManagerIntegrationModal
          option={option}
          cluster={cluster}
          mode={secretManager ? 'edit' : 'create'}
          initialValues={secretManager}
          onClose={closeModal}
          onSubmit={(payload) => {
            setSecretManagers((prev) => {
              if (secretManager) {
                return prev.map((item) =>
                  item.id === secretManager.id
                    ? {
                        ...payload,
                        // usedByServices: integration.usedByServices ?? 0,
                        // associatedItems: integration.associatedItems,
                      }
                    : item
                )
              }
              return [
                ...prev,
                {
                  ...payload,
                  // usedByServices: 0
                },
              ]
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

  const handleDeleteSecretManager = (integration: SecretManagerAccess) => {
    openModalConfirmation({
      title: 'Delete secret manager',
      name: integration.name,
      confirmationMethod: 'action',
      confirmationAction: 'delete',
      action: () => {
        // TODO [secret-manager] Double check if secret manager is used by any service

        // const hasSecrets = (integration.usedByServices ?? 0) > 0
        // if (hasSecrets) {
        //   openDeletionHelper(integration)
        // } else {
        // }

        setSecretManagers((prev) => prev.filter((item) => item.id !== integration.id))
      },
    })
  }

  const openSecretManagerAssociatedServicesModal = (integration: SecretManagerAccess) => {
    openModal({
      content: (
        <SecretManagerAssociatedItemsContent
          secretManagerAccessId={integration.id}
          organizationId={organizationId}
          integrationName={integration.name}
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
      secret_manager_accesses: secretManagers,
      keda: {
        enabled: isGcpCluster(cluster) ? false : kedaEnabled,
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
              <AddonToggleCard
                title="KEDA autoscaler"
                description="Qovery KEDA autoscaler allows you to add event-based autoscaling on all the services running on this cluster."
                badge={{ label: 'Free', color: 'green' }}
                activated={kedaEnabled}
                onToggle={() => setKedaEnabled((prev) => !prev)}
              />
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
                            onSelect={() => openSecretManagerModal(option)}
                          >
                            {option.label}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                    <SecretManagerList
                      secretManagers={secretManagers}
                      onEdit={(manager) =>
                        openSecretManagerModal(getSecretManagerOption(manager.endpoint.mode), manager)
                      }
                      onDelete={handleDeleteSecretManager}
                      onViewAssociatedServices={openSecretManagerAssociatedServicesModal}
                    />
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
