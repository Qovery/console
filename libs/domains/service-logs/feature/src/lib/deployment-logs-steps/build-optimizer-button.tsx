import { useParams } from '@tanstack/react-router'
import { type BuildAnalysisResult, type Environment } from 'qovery-typescript-axios'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { type BuildAnalysisServiceType } from '@qovery/domains/services/data-access'
import { useBuildAnalysis, useBuildAnalysisProgress, useStartBuildAnalysis } from '@qovery/domains/services/feature'
import { Button, Icon, Tooltip, toast, useModal } from '@qovery/shared/ui'
import { getBuildOptimizerState } from '../utils/build-analysis'
import { BuildOptimizationModal } from './build-optimization-modal'

function DisabledOptimizeButton({ reason }: { reason?: ReactNode }) {
  const button = (
    <Button size="xs" disabled>
      <Icon iconName="bolt" iconStyle="regular" />
      Optimize
    </Button>
  )

  if (!reason) return button

  return (
    <Tooltip content={reason}>
      <span>{button}</span>
    </Tooltip>
  )
}

export interface BuildOptimizerButtonProps {
  environment: Environment
  serviceId: string
  serviceType: BuildAnalysisServiceType
  // The build is analyzed once it went through
  isBuildSucceeded: boolean
}

export function BuildOptimizerButton({
  environment,
  serviceId,
  serviceType,
  isBuildSucceeded,
}: BuildOptimizerButtonProps) {
  const { organizationId = '', projectId = '', executionId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const { data: buildAnalysisState, isError } = useBuildAnalysis({
    serviceId,
    serviceType,
    enabled: isBuildSucceeded,
  })
  const { mutate: startBuildAnalysis, isLoading: isStarting } = useStartBuildAnalysis()
  // The analysis opens by itself once the one the user started ends
  const [isAwaitingResult, setIsAwaitingResult] = useState(false)

  const state = getBuildOptimizerState({ buildAnalysisState, executionId, isBuildSucceeded })
  const progress = useBuildAnalysisProgress({
    organizationId,
    clusterId: environment.cluster_id,
    projectId,
    environmentId: environment.id,
    serviceId,
    serviceType,
    enabled: state.type === 'ANALYZING',
  })

  const openAnalysis = useCallback(
    (analysis: BuildAnalysisResult) =>
      openModal({
        content: <BuildOptimizationModal analysis={analysis} onClose={closeModal} />,
        options: { width: 676 },
      }),
    [openModal, closeModal]
  )

  useEffect(() => {
    if (!isAwaitingResult) return
    if (state.type === 'DONE') {
      setIsAwaitingResult(false)
      openAnalysis(state.result)
    } else if (state.type === 'READY' && state.failedAnalysis) {
      setIsAwaitingResult(false)
      toast('error', 'The build analysis failed', state.failedAnalysis.failure_reason ?? undefined)
    }
  }, [isAwaitingResult, state, openAnalysis])

  // React Query keeps the last data when a refetch fails: a finished analysis stays available to reopen
  if (isError && state.type !== 'DONE') {
    return <DisabledOptimizeButton reason="The build analysis is unavailable" />
  }

  if (state.type === 'BUILD_NOT_SUCCEEDED') {
    return <DisabledOptimizeButton reason="Available once the build succeeded" />
  }
  if (state.type === 'LOADING') return <DisabledOptimizeButton />
  if (state.type === 'NOT_LATEST_BUILD') {
    return <DisabledOptimizeButton reason="Only the latest build can be analyzed" />
  }

  if (state.type === 'ANALYZING' || isStarting) {
    // The current step of the analysis, once its progress comes in
    const step = progress && !progress.terminal ? progress.step : undefined

    return (
      <Button size="xs" className="pointer-events-none" aria-disabled="true">
        <Icon iconName="spinner" iconStyle="regular" className="animate-spin" />
        {step ?? 'Analyzing'}...
      </Button>
    )
  }

  if (state.type === 'DONE') {
    return (
      <Button size="xs" onClick={() => openAnalysis(state.result)}>
        <Icon iconName="bolt" iconStyle="regular" />
        Open analysis
      </Button>
    )
  }

  const optimizeButton = (
    <Button
      size="xs"
      onClick={() =>
        startBuildAnalysis({ serviceId, serviceType, executionId }, { onSuccess: () => setIsAwaitingResult(true) })
      }
    >
      <Icon iconName="bolt" iconStyle="regular" />
      Optimize
    </Button>
  )

  if (!state.failedAnalysis) return optimizeButton

  return (
    <Tooltip
      content={`The last analysis failed${
        state.failedAnalysis.failure_reason ? `: ${state.failedAnalysis.failure_reason}` : ''
      }. Try again.`}
    >
      <span>{optimizeButton}</span>
    </Tooltip>
  )
}

export default BuildOptimizerButton
