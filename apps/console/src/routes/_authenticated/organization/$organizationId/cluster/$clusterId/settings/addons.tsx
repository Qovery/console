import { createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import {
  AddonToggleCard,
  SECRET_MANAGER_OPTIONS,
  SecretManagerAssociatedExternalSecretsModal,
  SecretManagerIntegrationModal,
  SecretManagerList,
  getSecretManagerOption,
  useCluster,
  useEditCluster,
} from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, Button, DropdownMenu, Icon, Section, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { isGcpCluster, isSameSecretManagerAccess } from '@qovery/shared/util-clusters'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/settings/addons')(
  {
    component: RouteComponent,
  }
)

function RouteComponent() {
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const secretManagerEnabled = useFeatureFlagEnabled('secret-manager') === true
  const { data: cluster } = useCluster({ organizationId, clusterId, suspense: true })
  const isGcp = isGcpCluster(cluster)

  const [kedaEnabled, setKedaEnabled] = useState(cluster?.keda?.enabled ?? false)

  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()
  const secretManagerDropdownOptions = useMemo(() => {
    if (!isGcp) {
      return SECRET_MANAGER_OPTIONS
    }

    const gcpOption = SECRET_MANAGER_OPTIONS.find((option) => option.value === 'GCP_SECRET_MANAGER')
    const awsOptions = SECRET_MANAGER_OPTIONS.filter((option) => option.value !== 'GCP_SECRET_MANAGER')
    return gcpOption ? [gcpOption, ...awsOptions] : SECRET_MANAGER_OPTIONS
  }, [isGcp])

  const [secretManagers, setSecretManagers] = useState<SecretManagerAccess[]>(
    () => cluster?.secret_manager_accesses ?? []
  )
  const clusterWithPendingSecretManagers = useMemo(
    () =>
      cluster
        ? {
            ...cluster,
            secret_manager_accesses: secretManagers,
          }
        : undefined,
    [cluster, secretManagers]
  )

  const openSecretManagerModal = (
    option: (typeof SECRET_MANAGER_OPTIONS)[number],
    secretManager?: SecretManagerAccess
  ) => {
    openModal({
      content: (
        <SecretManagerIntegrationModal
          option={option}
          cluster={clusterWithPendingSecretManagers}
          mode={secretManager ? 'edit' : 'create'}
          initialValues={secretManager}
          onClose={closeModal}
          onSubmit={(newEntityPayload) => {
            setSecretManagers((prev) => {
              if (secretManager) {
                return prev.map((item) =>
                  isSameSecretManagerAccess(item, secretManager)
                    ? {
                        ...item,
                        ...newEntityPayload,
                      }
                    : item
                )
              }
              return [
                ...prev,
                {
                  ...newEntityPayload,
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
        setSecretManagers((prev) => prev.filter((item) => !isSameSecretManagerAccess(item, integration)))
      },
    })
  }

  const openSecretManagerAssociatedExternalSecretsModal = (integration: SecretManagerAccess) => {
    openModal({
      content: (
        <SecretManagerAssociatedExternalSecretsModal
          secretManagerAccessId={integration.id}
          organizationId={organizationId}
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
      secret_manager_accesses: secretManagerEnabled ? secretManagers : cluster.secret_manager_accesses,
      keda: {
        enabled: kedaEnabled,
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
                      onViewAssociatedExternalSecrets={openSecretManagerAssociatedExternalSecretsModal}
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
