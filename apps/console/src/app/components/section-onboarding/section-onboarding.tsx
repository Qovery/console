import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Link as RouterLink } from '@tanstack/react-router'
import clsx from 'clsx'
import { ClusterStateEnum, StateEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { ClusterInstallationGuideModal, useClusterStatuses, useClusters } from '@qovery/domains/clusters/feature'
import { CreateCloneEnvironmentModal, useDeploymentRule, useEnvironments } from '@qovery/domains/environments/feature'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { useServiceStatuses, useServices } from '@qovery/domains/services/feature'
import { IconEnum } from '@qovery/shared/enums'
import { AnimatedGradientText, Button, Heading, Icon, Link, LogoIcon, useModal } from '@qovery/shared/ui'
import { McpSuggestionCard } from '@qovery/shared/mcp-suggestion/feature'
import { useLocalStorage, useSupportChat } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { useOrganizationOnboarding, useUpdateOrganizationOnboarding } from './use-organization-onboarding'

const QUEUED_CLUSTER_STATUSES: ClusterStateEnum[] = [ClusterStateEnum.DEPLOYMENT_QUEUED, ClusterStateEnum.QUEUED]
const ACTIVE_DEPLOYING_CLUSTER_STATUSES: ClusterStateEnum[] = [ClusterStateEnum.DEPLOYING, ClusterStateEnum.BUILDING]
const ALL_DEPLOYING_CLUSTER_STATUSES: ClusterStateEnum[] = [
  ...QUEUED_CLUSTER_STATUSES,
  ...ACTIVE_DEPLOYING_CLUSTER_STATUSES,
]

const QUEUED_SERVICE_STATUSES: StateEnum[] = [StateEnum.DEPLOYMENT_QUEUED, StateEnum.QUEUED]
const ACTIVE_DEPLOYING_SERVICE_STATUSES: StateEnum[] = [StateEnum.DEPLOYING, StateEnum.BUILDING]
const ALL_DEPLOYING_SERVICE_STATUSES: StateEnum[] = [...QUEUED_SERVICE_STATUSES, ...ACTIVE_DEPLOYING_SERVICE_STATUSES]

export interface SectionOnboardingProps {
  organizationId: string
}

export function SectionOnboarding({ organizationId }: SectionOnboardingProps) {
  const [localDismissed, setLocalDismissed] = useLocalStorage(`onboarding_section_dismissed_${organizationId}`, false)
  const { openModal, closeModal } = useModal()
  const { showPylonForm } = useSupportChat()

  const { data: organization } = useOrganization({ organizationId })
  const { data: onboarding, isLoading: isOnboardingLoading } = useOrganizationOnboarding({ organizationId })
  const { mutate: updateOnboarding } = useUpdateOrganizationOnboarding({ organizationId })

  const { data: clusters = [], isLoading: isClustersLoading } = useClusters({ organizationId })
  const { data: clusterStatuses = [], isLoading: isClusterStatusesLoading } = useClusterStatuses({ organizationId, refetchInterval: 3000 })
  const { data: projects = [] } = useProjects({ organizationId })

  const firstProject = projects[0]
  const { data: environments = [] } = useEnvironments({ projectId: firstProject?.id ?? '' })
  const firstEnvironment = environments[0]
  const { data: services = [] } = useServices({ environmentId: firstEnvironment?.id })
  const { data: serviceStatuses } = useServiceStatuses({ environmentId: firstEnvironment?.id })

  const isClusterDeployed = clusterStatuses.some((s) => s.status === ClusterStateEnum.DEPLOYED && s.is_deployed)
  const isClusterQueued =
    clusters.length > 0 &&
    !isClusterDeployed &&
    clusterStatuses.some((s) => QUEUED_CLUSTER_STATUSES.includes(s.status as ClusterStateEnum))
  const isClusterDeploying =
    clusters.length > 0 &&
    !isClusterDeployed &&
    clusterStatuses.some((s) => ACTIVE_DEPLOYING_CLUSTER_STATUSES.includes(s.status as ClusterStateEnum))
  const deployingClusterStatus = clusterStatuses.find((s) =>
    ALL_DEPLOYING_CLUSTER_STATUSES.includes(s.status as ClusterStateEnum)
  )
  const isClusterFailed =
    !isClusterDeployed &&
    clusterStatuses.some(
      (s) => s.status === ClusterStateEnum.DEPLOYMENT_ERROR || s.status === ClusterStateEnum.INVALID_CREDENTIALS
    )
  const failedClusterStatus = clusterStatuses.find(
    (s) => s.status === ClusterStateEnum.DEPLOYMENT_ERROR || s.status === ClusterStateEnum.INVALID_CREDENTIALS
  )

  const hasCluster = clusters.length > 0
  const hasEnvironment = environments.length > 0

  const allServiceStatuses = [
    ...(serviceStatuses?.applications ?? []),
    ...(serviceStatuses?.containers ?? []),
    ...(serviceStatuses?.jobs ?? []),
    ...(serviceStatuses?.helms ?? []),
    ...(serviceStatuses?.databases ?? []),
    ...(serviceStatuses?.terraforms ?? []),
  ]
  const hasService = services.length > 0
  const isServiceDeployed = allServiceStatuses.some((s) => s.state === StateEnum.DEPLOYED)
  const isServiceQueued = hasService && !isServiceDeployed && allServiceStatuses.some((s) => QUEUED_SERVICE_STATUSES.includes(s.state))
  const isServiceDeploying =
    hasService &&
    !isServiceDeployed &&
    allServiceStatuses.some((s) => ACTIVE_DEPLOYING_SERVICE_STATUSES.includes(s.state))
  const deployingServiceStatus = allServiceStatuses.find((s) => ALL_DEPLOYING_SERVICE_STATUSES.includes(s.state))
  const isServiceFailed =
    !isServiceDeployed &&
    allServiceStatuses.some(
      (s) => s.state === StateEnum.DEPLOYMENT_ERROR || s.state === StateEnum.BUILD_ERROR
    )
  const failedServiceStatus = allServiceStatuses.find(
    (s) => s.state === StateEnum.DEPLOYMENT_ERROR || s.state === StateEnum.BUILD_ERROR
  )
  const isServiceStopped =
    hasService &&
    !isServiceDeployed &&
    !isServiceQueued &&
    !isServiceDeploying &&
    !isServiceFailed &&
    allServiceStatuses.some((s) => s.state === StateEnum.STOPPED || s.state === StateEnum.STOP_ERROR)
  const stoppedServiceStatus = allServiceStatuses.find(
    (s) => s.state === StateEnum.STOPPED || s.state === StateEnum.STOP_ERROR
  )

  const useCases = (onboarding?.use_cases ?? '').split(',').filter(Boolean)
  const hasEphemeralEnvironments = useCases.includes('ephemeral-environments')
  const hasRde = useCases.includes('rde')

  const { data: deploymentRule } = useDeploymentRule({ environmentId: firstEnvironment?.id ?? '' })
  const isPreviewEnabled = hasEphemeralEnvironments && (deploymentRule?.auto_preview ?? false)

  const requiredStepsTotal = 4 + (hasEphemeralEnvironments ? 1 : 0)
  const completedCount = [
    true,
    isClusterDeployed,
    hasEnvironment,
    isServiceDeployed,
    ...(hasEphemeralEnvironments ? [isPreviewEnabled] : []),
  ].filter(Boolean).length
  const allRequiredDone = completedCount === requiredStepsTotal
  const progressPercent = Math.round((completedCount / requiredStepsTotal) * 100)

  const [clusterExpanded, setClusterExpanded] = useState(!hasCluster)

  const isDismissed = onboarding?.status === 'DISMISSED' || onboarding?.status === 'COMPLETED' || localDismissed

  const dismiss = () => {
    setLocalDismissed(true)
    updateOnboarding('DISMISSED')
  }

  const complete = () => {
    setLocalDismissed(true)
    updateOnboarding('COMPLETED')
  }

  const openInstallationGuideModal = ({ isDemo = false }: { isDemo?: boolean } = {}) =>
    openModal({
      options: { width: 500 },
      content: (
        <ClusterInstallationGuideModal mode="CREATE" isDemo={isDemo} type="ON_PREMISE" onClose={() => closeModal()} />
      ),
    })

  const openCreateEnvironmentModal = () => {
    if (!firstProject) return
    openModal({
      content: (
        <CreateCloneEnvironmentModal
          onClose={closeModal}
          onSuccess={closeModal}
          projectId={firstProject.id}
          organizationId={organizationId}
        />
      ),
      options: { fakeModal: true },
    })
  }

  if (!organization || isOnboardingLoading) return null
  if (!onboarding?.use_cases) return null

  if (isDismissed) return null

  const stepRowClass = 'flex items-center gap-3 px-4 py-3'
  const stepIconClass = 'w-4 text-center text-ssm text-neutral-subtle'

  const CLUSTERS_OPTIONS = [
    {
      highlight: true,
      tag: 'Recommended',
      title: 'Qovery managed',
      description:
        'Qovery will install and manage the Kubernetes cluster and the underlying infrastructure on your cloud provider account.',
      icon: <LogoIcon width="14" height="14" />,
      compatibleWith: [IconEnum.AWS, IconEnum.GCP, IconEnum.AZURE, IconEnum.SCW_GRAY] as IconEnum[],
      action: 'create-cluster' as const,
      dataAction: 'onboarding__cluster-option-managed',
    },
    {
      highlight: false,
      tag: 'Self-managed',
      title: 'Bring your own cluster',
      icon: 'cloud-cog',
      description:
        'You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge required.',
      compatibleWith: [
        IconEnum.AWS,
        IconEnum.GCP,
        IconEnum.AZURE,
        IconEnum.SCW_GRAY,
        IconEnum.OVH_CLOUD,
        IconEnum.DO,
        IconEnum.ORACLE_CLOUD,
        IconEnum.HETZNER,
        IconEnum.IBM_CLOUD,
        IconEnum.CIVO,
      ] as IconEnum[],
      action: 'installation-guide' as const,
      isDemo: false,
      dataAction: 'onboarding__cluster-option-byoc',
    },
    {
      highlight: false,
      tag: 'Demo',
      title: 'Local machine',
      icon: 'laptop-code',
      description:
        'Deploy a local Kubernetes cluster on your laptop using Docker Desktop. No cloud account or credit card required!',
      compatibleWith: null,
      action: 'installation-guide' as const,
      isDemo: true,
      dataAction: 'onboarding__cluster-option-demo',
    },
  ]

  const getCardClass = (highlight: boolean) =>
    twMerge(
      clsx(
        'flex flex-col gap-3 rounded-md border border-neutral bg-surface-neutral p-3 text-left transition-colors focus:outline-none',
        {
          'border-brand-subtle bg-surface-brand-subtle hover:border-brand-component hover:bg-surface-brand-component':
            highlight,
          'hover:bg-surface-neutral-subtle': !highlight,
        }
      )
    )

  const renderClusterCardContent = (option: (typeof CLUSTERS_OPTIONS)[number]) => (
    <>
      <span
        className={twMerge(
          clsx(
            'flex h-5 max-w-max items-center rounded-full bg-surface-neutral-component px-2 text-xs font-medium text-neutral-subtle',
            { 'bg-surface-brand-solid text-neutralInvert': option.highlight }
          )
        )}
      >
        {option.tag}
      </span>
      <span className="flex flex-col gap-1.5">
        <p className="flex items-center gap-1 text-ssm font-medium text-neutral">
          {typeof option.icon === 'string' ? (
            <Icon iconName={option.icon as IconName} className="text-xs text-neutral-subtle" />
          ) : (
            option.icon
          )}
          {option.title}
        </p>
        <p className="text-ssm text-neutral-subtle">{option.description}</p>
      </span>
      <span className="mt-auto flex flex-col gap-1">
        <span className="font-code text-2xs uppercase text-neutral">Compatible with</span>
        {option.compatibleWith ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {option.compatibleWith.map((provider) => (
              <Icon key={provider} name={provider} width={14} height={14} />
            ))}
          </div>
        ) : (
          <span className="text-ssm text-neutral-subtle">Every computer</span>
        )}
      </span>
    </>
  )

  if (allRequiredDone) {
    return (
      <div className="flex flex-col gap-3">
        <Heading level={2}>Getting started</Heading>
        <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
          <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-positive-subtle">
              <Icon iconName="party-horn" className="text-xl text-positive" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-neutral">You're all set!</p>
              <p className="text-ssm text-neutral-subtle">
                Your workspace is ready. Here's what you can explore next.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              {hasEphemeralEnvironments && (
                <a
                  href="https://www.qovery.com/docs/getting-started/guides/use-cases/preview-environments"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-md border border-neutral bg-surface-neutral-subtle px-3 py-2.5 text-left text-ssm text-neutral transition-colors hover:bg-surface-neutral-component"
                >
                  <Icon iconName="circle-check" className="shrink-0 text-sm text-positive" />
                  <span className="flex-1">Check how preview environments are working</span>
                  <Icon iconName="arrow-up-right-from-square" className="shrink-0 text-xs text-neutral-subtle" />
                </a>
              )}
              {hasRde && (
                <button
                  type="button"
                  onClick={() => showPylonForm('request-ai-builder-portal')}
                  className="flex items-center gap-2 rounded-md border border-neutral bg-surface-neutral-subtle px-3 py-2.5 text-left text-ssm text-neutral transition-colors hover:bg-surface-neutral-component"
                >
                  <Icon iconName="wand-magic-sparkles" className="shrink-0 text-sm text-neutral-subtle" />
                  <span className="flex-1">Ask for AI Builder Portal access</span>
                </button>
              )}
              <RouterLink
                to="/organization/$organizationId/settings/members"
                params={{ organizationId }}
                className="flex items-center gap-2 rounded-md border border-neutral bg-surface-neutral-subtle px-3 py-2.5 text-left text-ssm text-neutral transition-colors hover:bg-surface-neutral-component"
              >
                <Icon iconName="user-plus" className="shrink-0 text-sm text-neutral-subtle" />
                <span className="flex-1">Invite team members</span>
              </RouterLink>
            </div>
            <Button color="neutral" variant="outline" size="sm" onClick={complete}>
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Heading level={2}>Getting started</Heading>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-6 w-6 items-center justify-center rounded text-neutral-subtle transition-colors hover:bg-surface-neutral-subtle hover:text-neutral focus:outline-none"
          aria-label="Dismiss onboarding"
        >
          <Icon iconName="xmark" className="text-ssm" />
        </button>
      </div>

      {!allRequiredDone && (
        <McpSuggestionCard
          variant="setup"
          title="Let your agent do the configuration with"
          description="Just install our AI skills and ask your agent to get you started!"
        />
      )}

      <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
        <div className="flex items-center gap-3 border-b border-neutral px-4 py-3">
          <span className="font-code shrink-0 text-2xs uppercase text-neutral-subtle">Onboarding checklist</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-neutral-component">
            <div
              className="h-full rounded-full bg-surface-positive-solid transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="shrink-0 text-ssm font-medium text-neutral-subtle">{progressPercent}%</span>
        </div>

        <div className="divide-y divide-neutral">
          <div className={stepRowClass}>
            <Icon iconName="bolt" className={stepIconClass} />
            <span className="flex-1 text-ssm text-neutral-subtle line-through">Create and setup my workspace</span>
            <Icon iconName="circle-check" className="text-sm text-positive" />
          </div>

          <div>
            <button
              type="button"
              className={twMerge(
                clsx(stepRowClass, 'w-full text-left', !isClusterDeployed && 'hover:bg-surface-neutral-subtle')
              )}
              onClick={() => !isClusterDeployed && setClusterExpanded((v) => !v)}
              disabled={isClusterDeployed}
            >
              <Icon iconName="cube" className={stepIconClass} />
              <span
                className={clsx(
                  'flex-1 text-ssm',
                  isClusterDeployed ? 'text-neutral-subtle line-through' : 'text-neutral'
                )}
              >
                Create and deploy my first cluster
              </span>
              {isClusterDeployed ? (
                <Icon iconName="circle-check" className="text-sm text-positive" />
              ) : isClusterQueued ? (
                <span className="text-ssm font-normal text-neutral-subtle">Deployment queued...</span>
              ) : isClusterDeploying ? (
                <Link
                  to="/organization/$organizationId/cluster/$clusterId/cluster-logs"
                  params={{ organizationId, clusterId: deployingClusterStatus?.cluster_id ?? '' }}
                  color="brand"
                  underline
                  size="sm"
                  className="group flex truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AnimatedGradientText shimmerWidth={80} className="group-hover:text-brand">
                    <span className="flex items-center gap-0.5">
                      Deploying... <Icon iconName="arrow-up-right" />
                    </span>
                  </AnimatedGradientText>
                </Link>
              ) : isClusterFailed ? (
                <Link
                  to="/organization/$organizationId/cluster/$clusterId/cluster-logs"
                  params={{ organizationId, clusterId: failedClusterStatus?.cluster_id ?? '' }}
                  color="red"
                  underline
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {failedClusterStatus?.status === ClusterStateEnum.INVALID_CREDENTIALS
                    ? 'Invalid cloud credentials'
                    : 'Last deployment failed'}
                  <Icon iconName="arrow-up-right" />
                </Link>
              ) : (
                <Icon
                  iconName={clusterExpanded ? 'angle-up' : 'angle-down'}
                  className="text-xs text-neutral-subtle"
                />
              )}
            </button>

            {clusterExpanded && !hasCluster && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {CLUSTERS_OPTIONS.map((option) =>
                    option.action === 'create-cluster' ? (
                      <RouterLink
                        key={option.title}
                        to="/organization/$organizationId/cluster/new"
                        params={{ organizationId }}
                        data-action={option.dataAction}
                        className={getCardClass(option.highlight)}
                      >
                        {renderClusterCardContent(option)}
                      </RouterLink>
                    ) : (
                      <button
                        key={option.title}
                        type="button"
                        data-action={option.dataAction}
                        onClick={() => openInstallationGuideModal({ isDemo: option.isDemo })}
                        className={getCardClass(option.highlight)}
                      >
                        {renderClusterCardContent(option)}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={stepRowClass}>
            <Icon iconName="box" className={stepIconClass} />
            <span
              className={clsx(
                'flex-1 text-ssm',
                hasEnvironment ? 'text-neutral-subtle line-through' : hasCluster ? 'text-neutral' : 'text-neutral-disabled'
              )}
            >
              Create my first environment
            </span>
            {hasEnvironment ? (
              <Icon iconName="circle-check" className="text-sm text-positive" />
            ) : (
              <Button size="sm" color="neutral" variant="solid" disabled={!hasCluster} onClick={openCreateEnvironmentModal}>
                <Icon iconName="circle-plus" />
                New Environment
              </Button>
            )}
          </div>

          <div className={stepRowClass}>
            <Icon iconName="rocket" className={stepIconClass} />
            <span
              className={clsx(
                'flex-1 text-ssm',
                isServiceDeployed
                  ? 'text-neutral-subtle line-through'
                  : hasEnvironment
                    ? 'text-neutral'
                    : 'text-neutral-disabled'
              )}
            >
              Create and deploy my first application
            </span>
            {isServiceDeployed ? (
              <Icon iconName="circle-check" className="text-sm text-positive" />
            ) : isServiceQueued ? (
              <span className="text-ssm font-normal text-neutral-subtle">Deployment queued...</span>
            ) : isServiceDeploying ? (
              <Link
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId"
                params={{
                  organizationId,
                  projectId: firstProject?.id ?? '',
                  environmentId: firstEnvironment?.id ?? '',
                  serviceId: deployingServiceStatus?.id ?? '',
                  executionId: deployingServiceStatus?.execution_id ?? '',
                }}
                color="brand"
                underline
                size="sm"
                className="group flex truncate"
              >
                <AnimatedGradientText shimmerWidth={80} className="group-hover:text-brand">
                  <span className="flex items-center gap-0.5">
                    Deploying... <Icon iconName="arrow-up-right" />
                  </span>
                </AnimatedGradientText>
              </Link>
            ) : isServiceFailed ? (
              <Link
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId"
                params={{
                  organizationId,
                  projectId: firstProject?.id ?? '',
                  environmentId: firstEnvironment?.id ?? '',
                  serviceId: failedServiceStatus?.id ?? '',
                  executionId: failedServiceStatus?.execution_id ?? '',
                }}
                color="red"
                underline
                size="sm"
              >
                Last deployment failed <Icon iconName="arrow-up-right" />
              </Link>
            ) : isServiceStopped ? (
              <Link
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId"
                params={{
                  organizationId,
                  projectId: firstProject?.id ?? '',
                  environmentId: firstEnvironment?.id ?? '',
                  serviceId: stoppedServiceStatus?.id ?? '',
                }}
                color="neutral"
                underline
                size="sm"
              >
                Service stopped <Icon iconName="arrow-up-right" />
              </Link>
            ) : hasEnvironment ? (
              <Link
                as="button"
                size="sm"
                color="neutral"
                variant="solid"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/new"
                params={{
                  organizationId,
                  projectId: firstProject?.id ?? '',
                  environmentId: firstEnvironment?.id ?? '',
                }}
              >
                <Icon iconName="circle-plus" />
                New Service
              </Link>
            ) : (
              <Button size="sm" color="neutral" variant="solid" disabled>
                <Icon iconName="circle-plus" />
                New Service
              </Button>
            )}
          </div>

          {hasEphemeralEnvironments && (
            <div className={stepRowClass}>
              <Icon iconName="flask" className={stepIconClass} />
              <span
                className={clsx(
                  'flex-1 text-ssm',
                  isPreviewEnabled
                    ? 'text-neutral-subtle line-through'
                    : isServiceDeployed
                      ? 'text-neutral'
                      : 'text-neutral-disabled'
                )}
              >
                Turn on preview environment
              </span>
              {isPreviewEnabled ? (
                <Icon iconName="circle-check" className="text-sm text-positive" />
              ) : isServiceDeployed ? (
                <Link
                  as="button"
                  size="sm"
                  color="neutral"
                  variant="solid"
                  to="/organization/$organizationId/project/$projectId/environment/$environmentId/settings/preview-environments"
                  params={{
                    organizationId,
                    projectId: firstProject?.id ?? '',
                    environmentId: firstEnvironment?.id ?? '',
                  }}
                >
                  <Icon iconName="gear" />
                  Configure
                </Link>
              ) : (
                <Button size="sm" color="neutral" variant="solid" disabled>
                  <Icon iconName="gear" />
                  Configure
                </Button>
              )}
            </div>
          )}

          {hasRde && (
            <div className={stepRowClass}>
              <Icon iconName="laptop-code" className={stepIconClass} />
              <span className="flex-1 text-ssm text-neutral">AI Builder Portal</span>
              <Button size="sm" color="neutral" variant="solid" onClick={() => showPylonForm('request-ai-builder-portal')}>
                <Icon iconName="wand-magic-sparkles" />
                Ask for access
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SectionOnboarding
