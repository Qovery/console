import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type Cluster, type SecretManagerAccess } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect, useMemo } from 'react'
import { isSameSecretManagerAccess } from '@qovery/domains/clusters/data-access'
import {
  Badge,
  Button,
  DropdownMenu,
  FunnelFlowBody,
  Heading,
  Icon,
  Link,
  Section,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'
import {
  AddonToggleCard,
  SECRET_MANAGER_OPTIONS,
  SecretManagerList,
  getSecretManagerOption,
} from '../../cluster-addons'
import {
  SecretManagerIntegrationModal,
  type SecretManagerOption,
} from '../../secret-manager-modals/secret-manager-integration-modal'
import { steps, useClusterContainerCreateContext } from '../cluster-creation-flow'

export interface StepAddonsProps {
  organizationId: string
  onSubmit: () => void
}

interface StepAddonsFormProps {
  onSubmit: () => void
  organizationId: string
  backTo: '/organization/$organizationId/cluster/create/$slug/features'
}

function StepAddonsForm({ onSubmit, organizationId, backTo }: StepAddonsFormProps) {
  const { openModal, closeModal } = useModal()
  const { generalData, addonsData, setAddonsData } = useClusterContainerCreateContext()
  const secretManagerEnabled = useFeatureFlagEnabled('secret-manager')
  const isGcp = generalData?.cloud_provider === 'GCP'

  const secretManagerDropdownOptions = useMemo(() => {
    if (!isGcp) {
      return SECRET_MANAGER_OPTIONS
    }

    const gcpOption = SECRET_MANAGER_OPTIONS.find((option) => option.value === 'GCP_SECRET_MANAGER')
    const awsOptions = SECRET_MANAGER_OPTIONS.filter((option) => option.value !== 'GCP_SECRET_MANAGER')
    return gcpOption ? [gcpOption, ...awsOptions] : SECRET_MANAGER_OPTIONS
  }, [isGcp])

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    onSubmit()
  }

  const clusterStub = generalData
    ? ({
        cloud_provider: generalData.cloud_provider,
        secret_manager_accesses: addonsData.secretManagers,
      } as unknown as Cluster)
    : undefined

  const updateSecretManagers = (secretManagers: SecretManagerAccess[]) => {
    setAddonsData((addonsData) => ({
      ...addonsData,
      secretManagers,
    }))
  }

  const openSecretManagerModal = (option: SecretManagerOption, integration?: SecretManagerAccess) => {
    openModal({
      content: (
        <SecretManagerIntegrationModal
          option={option}
          cluster={clusterStub}
          mode={integration ? 'edit' : 'create'}
          initialValues={integration}
          onClose={closeModal}
          onSubmit={(payload) => {
            if (integration) {
              updateSecretManagers(
                addonsData.secretManagers.map((item) =>
                  isSameSecretManagerAccess(item, integration) ? { ...item, ...payload } : item
                )
              )
              return
            }

            updateSecretManagers([...addonsData.secretManagers, payload])
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
        <div className="divide-y divide-neutral overflow-hidden rounded-lg border border-neutral bg-surface-neutral shadow-[0_0_4px_0_rgba(0,0,0,0.01),0_2px_3px_0_rgba(0,0,0,0.02)]">
          <div className="p-4">
            <AddonToggleCard
              title="KEDA autoscaler"
              description="Qovery KEDA autoscaler allows you to add event-based autoscaling on all your services running on this cluster."
              activated={addonsData.kedaActivated}
              onToggle={() =>
                setAddonsData((addonsData) => ({ ...addonsData, kedaActivated: !addonsData.kedaActivated }))
              }
            />
          </div>

          {secretManagerEnabled && (
            <div className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral">Secret manager integration</span>
                    <Tooltip content="This feature is in beta. Behaviour and accessibility may change when released in GA.">
                      <Badge size="sm" radius="full" variant="surface" color="purple" className="text-ssm">
                        Beta
                      </Badge>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-neutral-subtle">
                    Link any secret manager on your cluster to add external secrets variables to all the services
                    running on your cluster.
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3">
                  <DropdownMenu.Root
                    onOpenChange={(open) => {
                      if (open) {
                        posthog.capture('cluster-secret-manager-add-clicked', {
                          organization_id: organizationId,
                          source: 'creation-flow',
                        })
                      }
                    }}
                  >
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
                            posthog.capture('cluster-secret-manager-type-selected', {
                              organization_id: organizationId,
                              secret_manager_type: option.value,
                            })
                            openSecretManagerModal(option)
                          }}
                        >
                          {option.label}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                  <SecretManagerList
                    secretManagers={addonsData.secretManagers}
                    onEdit={(manager) => openSecretManagerModal(getSecretManagerOption(manager.endpoint.mode), manager)}
                    onDelete={(manager) =>
                      updateSecretManagers(
                        addonsData.secretManagers.filter((item) => !isSameSecretManagerAccess(item, manager))
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}
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
