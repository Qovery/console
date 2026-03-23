import { useParams } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { P, match } from 'ts-pattern'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, EmptyState, Icon, Link, Section, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ConnectArgoCdModal, type ConnectArgoCdModalResponse } from './connect-argocd-modal'

const IMPORT_STEPS = [
  'Detecting all namespaces and services',
  'Linking detected cluster to existing clusters',
  'Creating new environments with detected services',
  'Updating existing environments with detected services',
] as const

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

export type SettingsArgoCdIntegrationUseCase = typeof USE_CASE_EMPTY_STATE | typeof USE_CASE_LOADING_INTEGRATION

export interface SettingsArgoCdIntegrationProps {
  useCaseId?: SettingsArgoCdIntegrationUseCase
}

const createLoadingIntegrationState = (): ArgoCdIntegrationState => ({
  clusterId: 'cluster-id',
  clusterName: 'undeletable_cluster',
  clusterCloudProvider: 'AWS',
  completedStepsCount: 0,
  currentStepProgress: 0,
  currentStepDurationMs: getFakeImportStepDelayMs(),
  isImporting: true,
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

export function SettingsArgoCdIntegration({ useCaseId }: SettingsArgoCdIntegrationProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const [argoCdIntegration, setArgoCdIntegration] = useState<ArgoCdIntegrationState | null>(null)
  useDocumentTitle('Argo CD integration - Organization settings')

  useEffect(() => {
    if (!useCaseId) {
      return
    }

    if (useCaseId === USE_CASE_EMPTY_STATE) {
      setArgoCdIntegration(null)
      return
    }

    if (useCaseId === USE_CASE_LOADING_INTEGRATION) {
      setArgoCdIntegration(createLoadingIntegrationState())
    }
  }, [useCaseId])

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

  const onConnectSuccess = (response: ConnectArgoCdModalResponse) => {
    setArgoCdIntegration({
      ...response,
      completedStepsCount: 0,
      currentStepProgress: 0,
      currentStepDurationMs: getFakeImportStepDelayMs(),
      isImporting: true,
    })
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
              <div className="relative z-[1] overflow-hidden rounded-lg border border-neutral bg-surface-neutral p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-neutral">ArgoCD running on</span>
                    <Link
                      to="/organization/$organizationId/cluster/$clusterId/overview"
                      params={{ organizationId, clusterId: argoCdIntegration.clusterId }}
                      className="rounded-md border border-neutral bg-surface-neutral px-1.5 py-1 text-ssm text-neutral hover:bg-surface-neutral-subtle"
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
              <div className="relative -top-[7px]">
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
