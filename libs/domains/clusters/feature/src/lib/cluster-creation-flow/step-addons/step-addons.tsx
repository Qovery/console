import { type CloudProvider, type ClusterRegion } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect, useMemo, useState } from 'react'
import { useCloudProviders } from '@qovery/domains/cloud-providers/feature'
import {
  Badge,
  Button,
  DropdownMenu,
  FunnelFlowBody,
  Heading,
  Icon,
  IconFlag,
  Link,
  Section,
  useModal,
} from '@qovery/shared/ui'
import {
  SecretManagerIntegrationModal,
  type SecretManagerOption,
} from '../../secret-manager-modals/secret-manager-integration-modal'
import { type ClusterAddonsSecretManager, steps, useClusterContainerCreateContext } from '../cluster-creation-flow'

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

const SECRET_MANAGER_OPTIONS: SecretManagerOption[] = [
  {
    value: 'aws-manager',
    label: 'AWS Secret manager',
    icon: 'AWS',
    typeLabel: 'AWS Secret manager',
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
  const hasAwsAutomaticIntegrationConfigured = integrations.some(
    (integration) => integration.provider === 'AWS' && integration.authentication === 'Automatic'
  )
  const hasAwsManualStsIntegrationConfigured = integrations.some(
    (integration) =>
      integration.provider === 'AWS' && integration.authentication === 'Manual' && integration.authType === 'sts'
  )
  const visibleAddons = useMemo(
    () => (generalData?.cloud_provider === 'GCP' ? ADDONS.filter((addon) => addon.id !== 'keda-autoscaler') : ADDONS),
    [generalData?.cloud_provider]
  )
  const secretManagerDropdownOptions = useMemo(() => {
    if (generalData?.cloud_provider !== 'GCP') {
      return SECRET_MANAGER_OPTIONS
    }

    const gcpOption = SECRET_MANAGER_OPTIONS.find((option) => option.value === 'gcp-secret')
    const awsOptions = SECRET_MANAGER_OPTIONS.filter((option) => option.value !== 'gcp-secret')
    return gcpOption ? [gcpOption, ...awsOptions] : SECRET_MANAGER_OPTIONS
  }, [generalData?.cloud_provider])
  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    onSubmit()
  }

  useEffect(() => {
    setAddonsData({
      observabilityActivated: Boolean(activatedAddons['qovery-observe']),
      kedaActivated: generalData?.cloud_provider === 'GCP' ? false : Boolean(activatedAddons['keda-autoscaler']),
      secretManagers: integrations,
    })
  }, [activatedAddons, generalData?.cloud_provider, integrations, setAddonsData])

  const getSecretManagerOption = (source: SecretManagerOption['value']) =>
    SECRET_MANAGER_OPTIONS.find((option) => option.value === source) ?? SECRET_MANAGER_OPTIONS[0]

  const openSecretManagerModal = (option: SecretManagerOption, integration?: ClusterAddonsSecretManager) => {
    openModal({
      content: (
        <SecretManagerIntegrationModal
          option={option}
          regionOptions={regionOptions}
          clusterProvider={generalData?.cloud_provider}
          hasAwsAutomaticIntegrationConfigured={hasAwsAutomaticIntegrationConfigured}
          hasAwsManualStsIntegrationConfigured={hasAwsManualStsIntegrationConfigured}
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
          {visibleAddons.map((addon, index) => (
            <div
              key={addon.id}
              className={`flex flex-col gap-3 p-4 ${index < visibleAddons.length - 1 ? 'border-b border-neutral' : ''}`}
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
