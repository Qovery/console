import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Link as RouterLink, useNavigate, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { ClusterStateEnum, StateEnum } from 'qovery-typescript-axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ClusterInstallationGuideModal, useClusterStatuses, useClusters } from '@qovery/domains/clusters/feature'
import { CreateCloneEnvironmentModal, useDeploymentRule, useEnvironments } from '@qovery/domains/environments/feature'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { useServiceStatuses, useServices } from '@qovery/domains/services/feature'
import { IconEnum } from '@qovery/shared/enums'
import { McpSuggestionCard } from '@qovery/shared/mcp-suggestion/feature'
import { AnimatedGradientText, Button, Heading, Icon, Link, LogoIcon, useModal } from '@qovery/shared/ui'
import { useLocalStorage, useSupportChat } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { CompletionPartyHornIllustration } from './completion-party-horn-illustration'
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

export function SectionOnboarding() {
  const { organizationId = '' } = useParams({ strict: false })
  const [localDismissed, setLocalDismissed] = useLocalStorage(`onboarding_section_dismissed_${organizationId}`, false)
  const { openModal, closeModal, enableAlertClickOutside } = useModal()
  const navigate = useNavigate()
  const { showPylonForm } = useSupportChat()

  const { data: organization } = useOrganization({ organizationId })
  const { data: onboarding, isLoading: isOnboardingLoading } = useOrganizationOnboarding({ organizationId })
  const { mutate: updateOnboarding } = useUpdateOrganizationOnboarding({ organizationId })

  const isOnboardingActive =
    Boolean(onboarding?.use_cases) &&
    onboarding?.status !== 'DISMISSED' &&
    onboarding?.status !== 'COMPLETED' &&
    !localDismissed

  const { data: clusters = [] } = useClusters({ organizationId, enabled: isOnboardingActive })
  const { data: clusterStatuses = [] } = useClusterStatuses({
    organizationId,
    refetchInterval: isOnboardingActive ? 3000 : undefined,
    enabled: isOnboardingActive,
  })
  const { data: projects = [] } = useProjects({ organizationId, enabled: isOnboardingActive })

  const firstProject = projects[0]
  const { data: environments = [] } = useEnvironments({ projectId: firstProject?.id ?? '' })
  const firstEnvironment = environments[0]
  const { data: services = [] } = useServices({ environmentId: firstEnvironment?.id })
  const { data: serviceStatuses } = useServiceStatuses({ environmentId: firstEnvironment?.id })
  const completionModalOpenedRef = useRef(false)

  const isClusterDeployed = useMemo(
    () => clusterStatuses.some((s) => s.status === ClusterStateEnum.DEPLOYED && s.is_deployed),
    [clusterStatuses]
  )
  const isClusterQueued = useMemo(
    () =>
      clusters.length > 0 &&
      !isClusterDeployed &&
      clusterStatuses.some((s) => QUEUED_CLUSTER_STATUSES.includes(s.status as ClusterStateEnum)),
    [clusters.length, isClusterDeployed, clusterStatuses]
  )
  const isClusterDeploying = useMemo(
    () =>
      clusters.length > 0 &&
      !isClusterDeployed &&
      clusterStatuses.some((s) => ACTIVE_DEPLOYING_CLUSTER_STATUSES.includes(s.status as ClusterStateEnum)),
    [clusters.length, isClusterDeployed, clusterStatuses]
  )
  const deployingClusterStatus = useMemo(
    () => clusterStatuses.find((s) => ALL_DEPLOYING_CLUSTER_STATUSES.includes(s.status as ClusterStateEnum)),
    [clusterStatuses]
  )
  const isClusterFailed = useMemo(
    () =>
      !isClusterDeployed &&
      clusterStatuses.some(
        (s) => s.status === ClusterStateEnum.DEPLOYMENT_ERROR || s.status === ClusterStateEnum.INVALID_CREDENTIALS
      ),
    [isClusterDeployed, clusterStatuses]
  )
  const failedClusterStatus = useMemo(
    () =>
      clusterStatuses.find(
        (s) => s.status === ClusterStateEnum.DEPLOYMENT_ERROR || s.status === ClusterStateEnum.INVALID_CREDENTIALS
      ),
    [clusterStatuses]
  )

  const hasCluster = clusters.length > 0
  const hasEnvironment = environments.length > 0

  const allServiceStatuses = useMemo(
    () => [
      ...(serviceStatuses?.applications ?? []),
      ...(serviceStatuses?.containers ?? []),
      ...(serviceStatuses?.jobs ?? []),
      ...(serviceStatuses?.helms ?? []),
      ...(serviceStatuses?.databases ?? []),
      ...(serviceStatuses?.terraforms ?? []),
    ],
    [serviceStatuses]
  )
  const hasService = services.length > 0
  const isServiceDeployed = useMemo(
    () => allServiceStatuses.some((s) => s.state === StateEnum.DEPLOYED),
    [allServiceStatuses]
  )
  const isServiceQueued = useMemo(
    () => hasService && !isServiceDeployed && allServiceStatuses.some((s) => QUEUED_SERVICE_STATUSES.includes(s.state)),
    [hasService, isServiceDeployed, allServiceStatuses]
  )
  const isServiceDeploying = useMemo(
    () =>
      hasService &&
      !isServiceDeployed &&
      allServiceStatuses.some((s) => ACTIVE_DEPLOYING_SERVICE_STATUSES.includes(s.state)),
    [hasService, isServiceDeployed, allServiceStatuses]
  )
  const deployingServiceStatus = useMemo(
    () => allServiceStatuses.find((s) => ALL_DEPLOYING_SERVICE_STATUSES.includes(s.state)),
    [allServiceStatuses]
  )
  const isServiceFailed = useMemo(
    () =>
      !isServiceDeployed &&
      allServiceStatuses.some((s) => s.state === StateEnum.DEPLOYMENT_ERROR || s.state === StateEnum.BUILD_ERROR),
    [isServiceDeployed, allServiceStatuses]
  )
  const failedServiceStatus = useMemo(
    () => allServiceStatuses.find((s) => s.state === StateEnum.DEPLOYMENT_ERROR || s.state === StateEnum.BUILD_ERROR),
    [allServiceStatuses]
  )
  const isServiceStopped = useMemo(
    () =>
      hasService &&
      !isServiceDeployed &&
      !isServiceQueued &&
      !isServiceDeploying &&
      !isServiceFailed &&
      allServiceStatuses.some((s) => s.state === StateEnum.STOPPED || s.state === StateEnum.STOP_ERROR),
    [hasService, isServiceDeployed, isServiceQueued, isServiceDeploying, isServiceFailed, allServiceStatuses]
  )
  const stoppedServiceStatus = useMemo(
    () => allServiceStatuses.find((s) => s.state === StateEnum.STOPPED || s.state === StateEnum.STOP_ERROR),
    [allServiceStatuses]
  )

  const useCases = useMemo(() => (onboarding?.use_cases ?? '').split(',').filter(Boolean), [onboarding?.use_cases])
  const hasEphemeralEnvironments = useCases.includes('ephemeral-environments')
  const hasRde = useCases.includes('rde')

  const { data: deploymentRule } = useDeploymentRule({
    environmentId: firstEnvironment?.id ?? '',
    enabled: !!firstEnvironment?.id,
  })
  const isPreviewEnabled = hasEphemeralEnvironments && (deploymentRule?.auto_preview ?? false)

  const requiredStepsTotal = 4 + (hasEphemeralEnvironments ? 1 : 0)
  const completedCount = useMemo(
    () =>
      [
        true,
        isClusterDeployed,
        hasEnvironment,
        isServiceDeployed,
        ...(hasEphemeralEnvironments ? [isPreviewEnabled] : []),
      ].filter(Boolean).length,
    [isClusterDeployed, hasEnvironment, isServiceDeployed, hasEphemeralEnvironments, isPreviewEnabled]
  )
  const allRequiredDone = completedCount === requiredStepsTotal
  const progressPercent = Math.round((completedCount / requiredStepsTotal) * 100)

  const [clusterExpanded, setClusterExpanded] = useState(!hasCluster)

  const isDismissed = onboarding?.status === 'DISMISSED' || onboarding?.status === 'COMPLETED' || localDismissed

  const dismiss = () => {
    setLocalDismissed(true)
    updateOnboarding('DISMISSED')
  }

  const complete = useCallback(() => {
    setLocalDismissed(true)
    updateOnboarding('COMPLETED')
  }, [setLocalDismissed, updateOnboarding])

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

  useEffect(() => {
    if (
      !organization ||
      isOnboardingLoading ||
      !onboarding?.use_cases ||
      !allRequiredDone ||
      isDismissed ||
      completionModalOpenedRef.current
    ) {
      return
    }

    completionModalOpenedRef.current = true
    enableAlertClickOutside(false)

    openModal({
      content: (
        <div className="flex flex-col items-center pb-8 text-center">
          <div className="mb-6 h-36 w-full">
            <CompletionPartyHornIllustration />
          </div>
          <div className="mb-6 flex flex-col gap-1 px-6">
            <p className="text-base font-medium text-neutral">You're all set!</p>
            <p className="text-sm text-neutral-subtle">
              Your workspace is completely ready to use.
              <br />
              Here&apos;s what you can explore next.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 px-6">
            {hasRde && (
              <Button
                type="button"
                onClick={() => {
                  complete()
                  closeModal()
                  showPylonForm('request-ai-builder-portal')
                }}
                color="neutral"
                variant="solid"
                size="md"
                className="gap-2"
              >
                <Icon iconName="wand-magic-sparkles" />
                AI portal access
              </Button>
            )}
            <Button
              type="button"
              color="neutral"
              variant={hasRde ? 'outline' : 'solid'}
              size="md"
              className="gap-2"
              onClick={() => {
                complete()
                closeModal()
                navigate({ to: '/organization/$organizationId/settings/members', params: { organizationId } })
              }}
            >
              <Icon iconName="user-plus" />
              Invite team
            </Button>
          </div>
        </div>
      ),
    })
  }, [
    allRequiredDone,
    closeModal,
    complete,
    enableAlertClickOutside,
    hasRde,
    isDismissed,
    isOnboardingLoading,
    navigate,
    onboarding?.use_cases,
    openModal,
    organization,
    organizationId,
    showPylonForm,
  ])

  if (!organization || isOnboardingLoading) return null
  if (!onboarding?.use_cases) return null

  if (isDismissed) return null
  if (allRequiredDone) return null

  const stepRowClass = 'flex h-[52px] items-center gap-2 px-4 py-3'
  const stepIconClass = 'w-4 text-center text-sm text-neutral-subtle'

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
      icon: 'cloud',
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
        <div className="flex h-12 items-center gap-4 border-b border-neutral bg-surface-neutral-subtle px-4 py-3">
          <span className="shrink-0 font-code text-xs uppercase text-neutral">Onboarding checklist</span>
          <div className="h-1 flex-1 overflow-hidden rounded-[1px] bg-surface-neutral-componentHover">
            <div
              className="h-full rounded-[1px] bg-surface-positive-solid shadow-[0_1px_1px_0_rgba(255,255,255,0.05)_inset,0_-1px_2px_0_rgba(0,0,0,0.16)_inset,0_0_4px_0_rgba(48,164,108,0.20)] transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="shrink-0 font-code text-xs tabular-nums text-neutral-subtle">{progressPercent}%</span>
        </div>

        <div className="divide-y divide-neutral">
          <div className={stepRowClass}>
            <Icon iconName="bolt" className={stepIconClass} />
            <span className="flex-1 text-sm font-medium text-neutral-subtle line-through">
              Create and setup my workspace
            </span>
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
                  'flex-1 text-sm font-medium',
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
                <Icon iconName={clusterExpanded ? 'angle-up' : 'angle-down'} className="text-xs text-neutral-subtle" />
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
                'flex-1 text-sm font-medium',
                hasEnvironment
                  ? 'text-neutral-subtle line-through'
                  : hasCluster
                    ? 'text-neutral'
                    : 'text-neutral-subtle'
              )}
            >
              Create my first environment
            </span>
            {hasEnvironment ? (
              <Icon iconName="circle-check" className="text-sm text-positive" />
            ) : hasCluster ? (
              <Button size="sm" color="neutral" variant="solid" onClick={openCreateEnvironmentModal}>
                <Icon iconName="circle-plus" />
                New Environment
              </Button>
            ) : null}
          </div>

          <div className={stepRowClass}>
            <Icon iconName="rocket" className={stepIconClass} />
            <span
              className={clsx(
                'flex-1 text-sm font-medium',
                isServiceDeployed
                  ? 'text-neutral-subtle line-through'
                  : hasEnvironment
                    ? 'text-neutral'
                    : 'text-neutral-subtle'
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
            ) : null}
          </div>

          {hasEphemeralEnvironments && (
            <div className={stepRowClass}>
              <Icon iconName="flask" className={stepIconClass} />
              <span
                className={clsx(
                  'flex-1 text-sm font-medium',
                  isPreviewEnabled
                    ? 'text-neutral-subtle line-through'
                    : isServiceDeployed
                      ? 'text-neutral'
                      : 'text-neutral-subtle'
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
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SectionOnboarding
