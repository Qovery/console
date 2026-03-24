import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { useParams } from '@tanstack/react-router'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { P, match } from 'ts-pattern'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, Button, EmptyState, Icon, Link, Section, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ArgoCdAssociatedServicesModal } from './argocd-associated-services-modal'
import { ConnectArgoCdModal, type ConnectArgoCdModalResponse } from './connect-argocd-modal'
import { DeleteArgoCdModal } from './delete-argocd-modal'
import { LinkQoveryClusterModal, type LinkQoveryClusterModalResponse } from './link-qovery-cluster-modal'

const IMPORT_STEPS = [
  'Detecting all namespaces and services',
  'Linking detected cluster to existing clusters',
  'Creating new environments with detected services',
  'Updating existing environments with detected services',
] as const

interface LinkedArgoCdCluster {
  id: string
  name: string
  cloudProvider?: string
  argoCdName: string
  clusterType: 'Qovery managed' | 'Self managed'
  environmentsDetected?: number
  detectedServices: number
  qoveryClusterId?: string
}

interface UnlinkedArgoCdCluster {
  id: string
  name: string
  environmentsDetected: number
  servicesDetected: number
}

const INITIAL_LINKED_CLUSTERS: LinkedArgoCdCluster[] = [
  {
    id: 'linked-aws',
    name: 'AWS EKS Demo',
    cloudProvider: 'AWS',
    argoCdName: 'kube-system',
    clusterType: 'Qovery managed',
    detectedServices: 4,
  },
  {
    id: 'linked-gitlab',
    name: 'GitLab Runner Cluster',
    argoCdName: 'gitlab-system',
    clusterType: 'Qovery managed',
    detectedServices: 13,
  },
  {
    id: 'linked-gcp',
    name: 'GCP Tokyo Cluster',
    cloudProvider: 'GCP',
    argoCdName: 'argocd',
    clusterType: 'Self managed',
    detectedServices: 42,
  },
]

const INITIAL_UNLINKED_CLUSTERS: UnlinkedArgoCdCluster[] = [
  {
    id: 'unlinked-kube-node',
    name: 'kube-node-lease',
    environmentsDetected: 32,
    servicesDetected: 88,
  },
  {
    id: 'unlinked-istio',
    name: 'istio-system',
    environmentsDetected: 32,
    servicesDetected: 88,
  },
]

const getInitialLinkedClusters = () => INITIAL_LINKED_CLUSTERS.map((cluster) => ({ ...cluster }))
const getInitialUnlinkedClusters = () => INITIAL_UNLINKED_CLUSTERS.map((cluster) => ({ ...cluster }))
const getInitialSingleLinkedCluster = () => {
  const [firstCluster] = getInitialLinkedClusters()
  return firstCluster ? [firstCluster] : []
}

type ArgoCdImportStepStatus = 'done' | 'current' | 'pending'

interface ArgoCdIntegrationState extends ConnectArgoCdModalResponse {
  completedStepsCount: number
  currentStepProgress: number
  currentStepDurationMs: number
  isImporting: boolean
}

// Temporary fake import timeline until ArgoCD integration status is streamed by backend.
const getFakeImportStepDelayMs = () => 2000 + Math.floor(Math.random() * 1000)

const STEP_ICON_SIZE = 14
const STEP_ICON_CENTER = STEP_ICON_SIZE / 2
const STEP_ICON_OUTER_STROKE_WIDTH = 0.8
const STEP_ICON_OUTER_RADIUS = 6.7
const STEP_ICON_STROKE_WIDTH = 1.5
const STEP_ICON_RADIUS = 6.25
const STEP_ICON_CIRCUMFERENCE = 2 * Math.PI * STEP_ICON_RADIUS

const USE_CASE_EMPTY_STATE = 'empty-state'
const USE_CASE_LOADING_INTEGRATION = 'loading-integration'
const USE_CASE_LOADED = 'loaded'
const USE_CASE_LOADED_SINGLE_CLUSTER = 'loaded-single-cluster'

export type SettingsArgoCdIntegrationUseCase =
  | typeof USE_CASE_EMPTY_STATE
  | typeof USE_CASE_LOADING_INTEGRATION
  | typeof USE_CASE_LOADED
  | typeof USE_CASE_LOADED_SINGLE_CLUSTER

export interface SettingsArgoCdIntegrationProps {
  useCaseId?: SettingsArgoCdIntegrationUseCase
}

const createLoadingIntegrationState = (): ArgoCdIntegrationState => ({
  clusterId: 'cluster-id',
  clusterName: 'undeletable_cluster',
  clusterCloudProvider: 'AWS',
  argoCdApiUrl: 'https://argocd.example.com/api',
  accessToken: 'fake-token',
  completedStepsCount: 0,
  currentStepProgress: 0,
  currentStepDurationMs: getFakeImportStepDelayMs(),
  isImporting: true,
})

const createLoadedIntegrationState = (): ArgoCdIntegrationState => ({
  clusterId: 'cluster-id',
  clusterName: 'undeletable_cluster',
  clusterCloudProvider: 'AWS',
  argoCdApiUrl: 'https://argocd.example.com/api',
  accessToken: 'fake-token',
  completedStepsCount: IMPORT_STEPS.length,
  currentStepProgress: 100,
  currentStepDurationMs: 0,
  isImporting: false,
})

function ArgoCdStepIcon({
  status,
  progress = 0,
  progressDurationMs = 2500,
}: {
  status: ArgoCdImportStepStatus
  progress?: number
  progressDurationMs?: number
}) {
  const clampedProgress = Math.max(0, Math.min(progress, 100))
  const progressValue = clampedProgress / 100

  return match(status)
    .with('done', () => (
      <span className="inline-flex size-[14px] items-center justify-center leading-none">
        <Icon iconName="circle-check" iconStyle="solid" className="text-[14px] leading-none text-brand" />
      </span>
    ))
    .with('current', () => (
      <span className="relative inline-flex size-[14px] items-center justify-center leading-none">
        <svg
          width={STEP_ICON_SIZE}
          height={STEP_ICON_SIZE}
          viewBox="0 0 14 14"
          aria-hidden="true"
          className="absolute inset-0 block"
        >
          <circle
            cx={STEP_ICON_CENTER}
            cy={STEP_ICON_CENTER}
            r={STEP_ICON_OUTER_RADIUS}
            fill="none"
            stroke="var(--brand-6)"
            strokeWidth={STEP_ICON_OUTER_STROKE_WIDTH}
            opacity={0.7}
          />
        </svg>
        <svg
          width={STEP_ICON_SIZE}
          height={STEP_ICON_SIZE}
          viewBox="0 0 14 14"
          aria-hidden="true"
          className="absolute inset-0 block -rotate-90"
        >
          <circle
            cx={STEP_ICON_CENTER}
            cy={STEP_ICON_CENTER}
            r={STEP_ICON_RADIUS}
            fill="none"
            stroke="var(--brand-6)"
            strokeWidth={STEP_ICON_STROKE_WIDTH}
            strokeLinecap="round"
          />
          <circle
            cx={STEP_ICON_CENTER}
            cy={STEP_ICON_CENTER}
            r={STEP_ICON_RADIUS}
            fill="none"
            stroke="var(--brand-9)"
            strokeWidth={STEP_ICON_STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={STEP_ICON_CIRCUMFERENCE}
            strokeDashoffset={STEP_ICON_CIRCUMFERENCE * (1 - progressValue)}
            className="transition-[stroke-dashoffset] ease-out"
            style={{
              transitionDuration: `${progressDurationMs}ms`,
              willChange: 'stroke-dashoffset',
            }}
          />
        </svg>
      </span>
    ))
    .otherwise(() => (
      <span className="inline-flex size-[14px] items-center justify-center leading-none">
        <svg width={STEP_ICON_SIZE} height={STEP_ICON_SIZE} viewBox="0 0 14 14" aria-hidden="true" className="block">
          <circle
            cx={STEP_ICON_CENTER}
            cy={STEP_ICON_CENTER}
            r={STEP_ICON_RADIUS}
            fill="none"
            stroke="var(--border-neutral-disabled)"
            strokeWidth={STEP_ICON_STROKE_WIDTH}
          />
        </svg>
      </span>
    ))
}

interface ArgoCdSectionProps {
  id: 'linked' | 'unlinked'
  title: string
  count: number
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  hasBottomBorder?: boolean
  children?: ReactNode
}

function ArgoCdSection({
  id,
  title,
  count,
  isOpen,
  onOpenChange,
  hasBottomBorder = true,
  children,
}: ArgoCdSectionProps) {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      value={isOpen ? id : ''}
      onValueChange={(value) => onOpenChange(value === id)}
      className="w-full"
    >
      <AccordionPrimitive.Item value={id} className={hasBottomBorder ? 'w-full border-b border-neutral' : 'w-full'}>
        <AccordionPrimitive.Trigger
          className={match(isOpen)
            .with(true, () =>
              match(id)
                .with('unlinked', () => 'group flex w-full items-center justify-between px-4 pb-1 pt-4 text-left')
                .otherwise(() => 'group flex w-full items-center justify-between px-4 pb-3 pt-4 text-left')
            )
            .otherwise(() => 'group flex w-full items-center justify-between p-4 text-left')}
        >
          <span
            className={match(isOpen)
              .with(true, () => 'text-sm font-medium text-neutral')
              .otherwise(() => 'text-sm font-medium text-neutral-subtle')}
          >
            {title} ({count})
          </span>
          <Icon
            iconName="angle-down"
            iconStyle="regular"
            className={match(isOpen)
              .with(true, () => 'rotate-180 text-sm text-neutral transition-transform duration-200')
              .otherwise(() => 'text-sm text-neutral-subtle transition-transform duration-200')}
          />
        </AccordionPrimitive.Trigger>
        <AccordionPrimitive.Content className="data-[state=closed]:slidein-up-sm-faded overflow-hidden px-4 pb-4 data-[state=open]:animate-slidein-down-sm-faded">
          {children}
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  )
}

export function SettingsArgoCdIntegration({ useCaseId }: SettingsArgoCdIntegrationProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const [argoCdIntegration, setArgoCdIntegration] = useState<ArgoCdIntegrationState | null>(null)
  const [isLinkedSectionOpen, setIsLinkedSectionOpen] = useState(false)
  const [isUnlinkedSectionOpen, setIsUnlinkedSectionOpen] = useState(false)
  const [linkedClusters, setLinkedClusters] = useState<LinkedArgoCdCluster[]>(() => getInitialLinkedClusters())
  const [unlinkedClusters, setUnlinkedClusters] = useState<UnlinkedArgoCdCluster[]>(() => getInitialUnlinkedClusters())
  useDocumentTitle('Argo CD integration - Organization settings')

  const resetClusterLists = useCallback(() => {
    setLinkedClusters(getInitialLinkedClusters())
    setUnlinkedClusters(getInitialUnlinkedClusters())
  }, [])

  useEffect(() => {
    if (!useCaseId) {
      return
    }

    if (useCaseId === USE_CASE_EMPTY_STATE) {
      setArgoCdIntegration(null)
      resetClusterLists()
      return
    }

    if (useCaseId === USE_CASE_LOADING_INTEGRATION) {
      setArgoCdIntegration(createLoadingIntegrationState())
      resetClusterLists()
      return
    }

    if (useCaseId === USE_CASE_LOADED) {
      setArgoCdIntegration(createLoadedIntegrationState())
      setIsLinkedSectionOpen(false)
      setIsUnlinkedSectionOpen(false)
      resetClusterLists()
      return
    }

    if (useCaseId === USE_CASE_LOADED_SINGLE_CLUSTER) {
      setArgoCdIntegration(createLoadedIntegrationState())
      setIsLinkedSectionOpen(false)
      setIsUnlinkedSectionOpen(false)
      setLinkedClusters(getInitialSingleLinkedCluster())
      setUnlinkedClusters([])
    }
  }, [useCaseId, resetClusterLists])

  useEffect(() => {
    if (!argoCdIntegration?.isImporting) {
      return
    }

    const durationMs = argoCdIntegration.currentStepDurationMs
    const animationFrame = requestAnimationFrame(() => {
      setArgoCdIntegration((currentState) => {
        if (!currentState || !currentState.isImporting) {
          return currentState
        }

        return {
          ...currentState,
          currentStepProgress: 100,
        }
      })
    })

    const timeout = setTimeout(() => {
      setArgoCdIntegration((currentState) => {
        if (!currentState || !currentState.isImporting) {
          return currentState
        }

        const nextCompletedStepsCount = currentState.completedStepsCount + 1
        if (nextCompletedStepsCount >= IMPORT_STEPS.length) {
          return {
            ...currentState,
            completedStepsCount: IMPORT_STEPS.length,
            currentStepProgress: 100,
            isImporting: false,
          }
        }

        return {
          ...currentState,
          completedStepsCount: nextCompletedStepsCount,
          currentStepProgress: 0,
          currentStepDurationMs: getFakeImportStepDelayMs(),
        }
      })
    }, durationMs)

    return () => {
      cancelAnimationFrame(animationFrame)
      clearTimeout(timeout)
    }
  }, [argoCdIntegration?.isImporting, argoCdIntegration?.completedStepsCount, argoCdIntegration?.currentStepDurationMs])

  const importStepsWithStatus = useMemo(() => {
    const completedStepsCount = argoCdIntegration?.completedStepsCount ?? 0
    const isImporting = argoCdIntegration?.isImporting ?? false

    return IMPORT_STEPS.map((step, index) => ({
      label: step,
      status: match({ completedStepsCount, isImporting, index })
        .with({ index: P.when((stepIndex) => stepIndex < completedStepsCount) }, () => 'done' as const)
        .with({ index: completedStepsCount, isImporting: true }, () => 'current' as const)
        .otherwise(() => 'pending' as const),
    }))
  }, [argoCdIntegration?.completedStepsCount, argoCdIntegration?.isImporting])

  const hasLinkedClusters = linkedClusters.length > 0
  const hasUnlinkedClusters = unlinkedClusters.length > 0

  const onConnectSuccess = (response: ConnectArgoCdModalResponse) => {
    resetClusterLists()
    setArgoCdIntegration({
      ...response,
      completedStepsCount: 0,
      currentStepProgress: 0,
      currentStepDurationMs: getFakeImportStepDelayMs(),
      isImporting: true,
    })
  }

  const onLinkClusterSuccess = (unlinkedCluster: UnlinkedArgoCdCluster, response: LinkQoveryClusterModalResponse) => {
    setUnlinkedClusters((currentUnlinkedClusters) =>
      currentUnlinkedClusters.filter(({ id }) => id !== unlinkedCluster.id)
    )
    setLinkedClusters((currentLinkedClusters) => [
      ...currentLinkedClusters,
      {
        id: `linked-${response.clusterId}-${unlinkedCluster.id}`,
        qoveryClusterId: response.clusterId,
        name: response.clusterName,
        cloudProvider: response.clusterCloudProvider,
        argoCdName: unlinkedCluster.name,
        clusterType: response.clusterType,
        environmentsDetected: unlinkedCluster.environmentsDetected,
        detectedServices: unlinkedCluster.servicesDetected,
      },
    ])
  }

  const onUnlinkCluster = (linkedCluster: LinkedArgoCdCluster) => {
    setLinkedClusters((currentLinkedClusters) => currentLinkedClusters.filter(({ id }) => id !== linkedCluster.id))
    setUnlinkedClusters((currentUnlinkedClusters) => [
      ...currentUnlinkedClusters,
      {
        id: `unlinked-${linkedCluster.id}`,
        name: linkedCluster.argoCdName,
        environmentsDetected: linkedCluster.environmentsDetected ?? 0,
        servicesDetected: linkedCluster.detectedServices,
      },
    ])
  }

  const onDeleteSuccess = () => {
    setArgoCdIntegration(null)
    setIsLinkedSectionOpen(false)
    setIsUnlinkedSectionOpen(false)
    resetClusterLists()
  }

  const onOpenConnectModal = () => {
    openModal({
      content: (
        <ConnectArgoCdModal
          organizationId={organizationId}
          onClose={(response) => {
            closeModal()
            if (response) {
              onConnectSuccess(response)
            }
          }}
        />
      ),
      options: {
        width: 676,
      },
    })
  }

  const onOpenEditModal = () => {
    if (!argoCdIntegration) {
      return
    }

    openModal({
      content: (
        <ConnectArgoCdModal
          organizationId={organizationId}
          isEdit
          disableTargetClusterSelection
          initialValues={{
            targetCluster: argoCdIntegration.clusterId,
            argoCdApiUrl: argoCdIntegration.argoCdApiUrl,
            accessToken: argoCdIntegration.accessToken,
          }}
          initialCluster={{
            id: argoCdIntegration.clusterId,
            name: argoCdIntegration.clusterName,
            cloudProvider: argoCdIntegration.clusterCloudProvider,
          }}
          onClose={(response) => {
            closeModal()
            if (response) {
              onConnectSuccess(response)
            }
          }}
        />
      ),
      options: {
        width: 676,
      },
    })
  }

  const onOpenDeleteModal = () => {
    openModal({
      content: <DeleteArgoCdModal onSubmit={onDeleteSuccess} />,
      options: {
        width: 488,
      },
    })
  }

  const onOpenLinkClusterModal = (unlinkedCluster: UnlinkedArgoCdCluster) => {
    openModal({
      content: (
        <LinkQoveryClusterModal
          organizationId={organizationId}
          argoCdClusterName={unlinkedCluster.name}
          environmentsDetected={unlinkedCluster.environmentsDetected}
          servicesDetected={unlinkedCluster.servicesDetected}
          linkedClusterIds={linkedClusters
            .map(({ qoveryClusterId }) => qoveryClusterId)
            .filter((clusterId): clusterId is string => !!clusterId)}
          onClose={(response) => {
            closeModal()
            if (response) {
              onLinkClusterSuccess(unlinkedCluster, response)
            }
          }}
        />
      ),
      options: {
        width: 488,
      },
    })
  }

  const onOpenAssociatedServicesModal = (linkedCluster: LinkedArgoCdCluster) => {
    openModal({
      content: (
        <ArgoCdAssociatedServicesModal
          organizationId={organizationId}
          clusterName={linkedCluster.name}
          associatedItemsCount={linkedCluster.detectedServices}
          onClose={closeModal}
        />
      ),
    })
  }

  const isSingleClusterDetected = useCaseId === USE_CASE_LOADED_SINGLE_CLUSTER
  const singleDetectedCluster = linkedClusters[0]

  return (
    <div className="w-full">
      <Section className="px-8 pb-8 pt-6">
        <div className="relative">
          <SettingsHeading
            title="Argo CD integration"
            description="Connect your ArgoCD instances to discover and monitor its applications directly in Qovery."
            showNeedHelp={false}
          />
          <Button className="absolute right-0 top-0 gap-2" size="md" onClick={onOpenConnectModal}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add ArgoCD
          </Button>
        </div>
        <div className="max-w-content-with-navigation-left">
          {argoCdIntegration ? (
            <div className="w-full max-w-[648px]">
              {argoCdIntegration.isImporting ? (
                <div className="relative z-[1] overflow-hidden rounded-lg border border-neutral bg-surface-neutral p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-neutral">ArgoCD running on</span>
                      <Link
                        to="/organization/$organizationId/cluster/$clusterId/overview"
                        params={{ organizationId, clusterId: argoCdIntegration.clusterId }}
                        className="h-6 rounded-md border border-neutral bg-surface-neutral px-1.5 text-ssm font-normal text-neutral hover:bg-surface-neutral-subtle hover:text-neutral"
                        data-testid="argocd-cluster-link"
                      >
                        {argoCdIntegration.clusterCloudProvider && (
                          <Icon name={argoCdIntegration.clusterCloudProvider} width="16" height="16" />
                        )}
                        {argoCdIntegration.clusterName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        variant="outline"
                        color="neutral"
                        iconOnly
                        disabled={argoCdIntegration.isImporting}
                        data-testid="edit-argocd-integration"
                      >
                        <Icon iconName="pencil" iconStyle="regular" className="text-xs" />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        color="neutral"
                        iconOnly
                        disabled={argoCdIntegration.isImporting}
                        data-testid="delete-argocd-integration"
                      >
                        <Icon iconName="trash" iconStyle="regular" className="text-xs" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              {argoCdIntegration.isImporting ? (
                <div className={argoCdIntegration.isImporting ? 'relative -top-[7px]' : 'relative'}>
                  <div className="flex flex-col gap-3 rounded-b-lg border border-t-0 border-neutral bg-surface-neutral-subtle p-4">
                    {importStepsWithStatus.map((step) => (
                      <div key={step.label} className="flex items-center gap-2">
                        <ArgoCdStepIcon
                          status={step.status}
                          progress={
                            step.status === 'current' && argoCdIntegration ? argoCdIntegration.currentStepProgress : 0
                          }
                          progressDurationMs={argoCdIntegration?.currentStepDurationMs}
                        />
                        <span
                          className={match(step.status)
                            .with('pending', () => 'text-ssm text-neutral-disabled')
                            .otherwise(() => 'text-ssm text-neutral')}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg bg-surface-neutral-subtle">
                  <div className="relative z-[1] overflow-hidden rounded-lg border border-neutral bg-surface-neutral shadow-[0px_0px_4px_0px_rgba(0,0,0,0.01),0px_2px_3px_0px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between px-4 pb-2 pt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-neutral">ArgoCD running on</span>
                        <Link
                          to="/organization/$organizationId/cluster/$clusterId/overview"
                          params={{ organizationId, clusterId: argoCdIntegration.clusterId }}
                          className="h-6 rounded-md border border-neutral bg-surface-neutral px-1.5 text-ssm font-normal text-neutral hover:bg-surface-neutral-subtle hover:text-neutral"
                          data-testid="argocd-cluster-link"
                        >
                          {argoCdIntegration.clusterCloudProvider && (
                            <Icon name={argoCdIntegration.clusterCloudProvider} width="16" height="16" />
                          )}
                          {argoCdIntegration.clusterName}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          color="neutral"
                          iconOnly
                          data-testid="edit-argocd-integration"
                          onClick={onOpenEditModal}
                        >
                          <Icon iconName="pencil" iconStyle="regular" className="text-xs" />
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          color="neutral"
                          iconOnly
                          data-testid="delete-argocd-integration"
                          onClick={onOpenDeleteModal}
                        >
                          <Icon iconName="trash" iconStyle="regular" className="text-xs" />
                        </Button>
                      </div>
                    </div>

                    {isSingleClusterDetected && singleDetectedCluster ? (
                      <div className="px-4 pb-4 pt-2">
                        <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                {singleDetectedCluster.cloudProvider ? (
                                  <Icon name={singleDetectedCluster.cloudProvider} width="16" height="16" />
                                ) : null}
                                <span className="text-ssm font-medium text-neutral">{singleDetectedCluster.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-ssm text-neutral-subtle">
                                <span>
                                  ArgoCD name: <span className="text-neutral">{singleDetectedCluster.argoCdName}</span>
                                </span>
                                <span>
                                  Cluster type:{' '}
                                  <span className="text-neutral">{singleDetectedCluster.clusterType}</span>
                                </span>
                              </div>
                            </div>
                            <Button
                              size="md"
                              variant="outline"
                              color="neutral"
                              iconOnly
                              className="relative"
                              onClick={() => onOpenAssociatedServicesModal(singleDetectedCluster)}
                              data-testid={`open-associated-services-${singleDetectedCluster.id}`}
                            >
                              <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-surface-brand-solid text-3xs font-bold leading-[0] text-neutralInvert">
                                {singleDetectedCluster.detectedServices}
                              </span>
                              <Icon iconName="layer-group" iconStyle="regular" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {hasLinkedClusters ? (
                          <ArgoCdSection
                            id="linked"
                            title="Linked clusters"
                            count={linkedClusters.length}
                            isOpen={isLinkedSectionOpen}
                            onOpenChange={setIsLinkedSectionOpen}
                            hasBottomBorder={hasUnlinkedClusters}
                          >
                            <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
                              {linkedClusters.map((cluster) => (
                                <div
                                  key={cluster.id}
                                  className="flex items-center justify-between border-b border-neutral px-4 py-3 last:border-b-0"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5">
                                      {cluster.cloudProvider ? (
                                        <Icon name={cluster.cloudProvider} width="16" height="16" />
                                      ) : null}
                                      <span className="text-ssm font-medium text-neutral">{cluster.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-ssm text-neutral-subtle">
                                      <span>
                                        ArgoCD name: <span className="text-neutral">{cluster.argoCdName}</span>
                                      </span>
                                      <span>
                                        Cluster type: <span className="text-neutral">{cluster.clusterType}</span>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="md"
                                      variant="outline"
                                      color="neutral"
                                      iconOnly
                                      className="relative"
                                      onClick={() => onOpenAssociatedServicesModal(cluster)}
                                      data-testid={`open-associated-services-${cluster.id}`}
                                    >
                                      <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-surface-brand-solid text-3xs font-bold leading-[0] text-neutralInvert">
                                        {cluster.detectedServices}
                                      </span>
                                      <Icon iconName="layer-group" iconStyle="regular" />
                                    </Button>
                                    <Button
                                      size="md"
                                      variant="outline"
                                      color="neutral"
                                      iconOnly
                                      onClick={() => onUnlinkCluster(cluster)}
                                      data-testid={`unlink-linked-cluster-${cluster.id}`}
                                    >
                                      <Icon iconName="link-broken" iconStyle="regular" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ArgoCdSection>
                        ) : null}

                        {hasUnlinkedClusters ? (
                          <ArgoCdSection
                            id="unlinked"
                            title="Unlinked clusters"
                            count={unlinkedClusters.length}
                            isOpen={isUnlinkedSectionOpen}
                            onOpenChange={setIsUnlinkedSectionOpen}
                            hasBottomBorder={false}
                          >
                            <p className="mb-3 text-sm text-neutral-subtle">
                              Unlinked clusters are clusters detected by ArgoCD that are not yet associated with a
                              cluster in Qovery. Add the cluster to Qovery, then link it here to display the services
                              running on it.
                            </p>
                            <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
                              {unlinkedClusters.map((cluster) => (
                                <div
                                  key={cluster.id}
                                  className="flex items-center justify-between border-b border-neutral px-4 py-3 last:border-b-0"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-ssm font-medium text-neutral">{cluster.name}</span>
                                    <div className="flex items-center gap-2 text-ssm text-neutral-subtle">
                                      <span>
                                        Environments detected:{' '}
                                        <span className="text-neutral">{cluster.environmentsDetected}</span>
                                      </span>
                                      <span>
                                        Services detected:{' '}
                                        <span className="text-neutral">{cluster.servicesDetected}</span>
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    size="md"
                                    variant="outline"
                                    color="neutral"
                                    iconOnly
                                    onClick={() => onOpenLinkClusterModal(cluster)}
                                    data-testid={`link-unlinked-cluster-${cluster.id}`}
                                  >
                                    <Icon iconName="link" iconStyle="regular" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ArgoCdSection>
                        ) : null}
                      </>
                    )}
                  </div>

                  <div className="-mt-[7px] flex items-center gap-2 rounded-b-lg border border-t-0 border-neutral bg-surface-neutral-subtle px-4 pb-3 pt-[calc(0.75rem+7px)]">
                    <Badge size="base" color="green" variant="surface" className="gap-1 font-medium">
                      <Icon iconName="circle-check" iconStyle="regular" className="text-xs text-positive" />
                      Connected
                    </Badge>
                    <p className="text-ssm text-neutral-subtle">
                      Last update <span className="text-neutral">3 min ago</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No ArgoCD integration configured"
              description="Add your first ArgoCD instance to automatically visualize them in Qovery."
              icon="link"
              className="h-auto min-h-[146px] w-full max-w-[648px] p-8"
            >
              <Button variant="outline" color="neutral" size="md" className="gap-2" onClick={onOpenConnectModal}>
                <Icon iconName="circle-plus" iconStyle="regular" />
                Add ArgoCD
              </Button>
            </EmptyState>
          )}
        </div>
      </Section>
    </div>
  )
}
