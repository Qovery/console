import { useEffect, useMemo, useState } from 'react'
import { useClusterLogs } from '../use-cluster-logs/use-cluster-logs'

export type StepStatus = 'current' | 'pending' | 'done'
export type LifecycleState = 'idle' | 'installing' | 'succeeded' | 'failed'

export const DEPLOYMENT_STEPS = [
  'Validating configuration',
  'Providing infrastructure (on provider side)',
  'Verifying provided infrastructure',
  'Installing Qovery stack',
  'Verifying kube deprecation API calls',
]

export interface UseDeploymentProgressProps {
  organizationId: string
  clusterId: string
  clusterName?: string
  cloudProvider?: string
}

type ProgressCacheEntry = {
  highestStepIndex: number
  installationComplete: boolean
  lastTimestamp?: number
  creationFailed?: boolean
  state?: LifecycleState
  prevState?: LifecycleState
}

// Module-level cache to survive remounts within the same session
const progressCache = new Map<string, ProgressCacheEntry>()

export const getCachedDeploymentProgress = (clusterId: string): ProgressCacheEntry | undefined =>
  progressCache.get(clusterId)

export function useDeploymentProgress({
  organizationId,
  clusterId,
  clusterName,
  cloudProvider,
}: UseDeploymentProgressProps): {
  steps: { label: string; status: StepStatus }[]
  installationComplete: boolean
  highestStepIndex: number
  progressValue: number
  currentStepLabel: string
  creationFailed: boolean
  state: LifecycleState
  justSucceeded: boolean
  justFailed: boolean
} {
  const { data: clusterLogs } = useClusterLogs({
    organizationId,
    clusterId,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  })

  const providerCode = useMemo(() => {
    switch (cloudProvider) {
      case 'AWS':
        return 'EKS'
      case 'GCP':
        return 'GKE'
      case 'AZURE':
        return 'AKS'
      case 'SCALEWAY':
        return 'ScwKapsule'
      default:
        return ''
    }
  }, [cloudProvider])

  const [{ highestStepIndex, installationComplete }, setProgress] = useState<{
    highestStepIndex: number
    installationComplete: boolean
  }>(() => progressCache.get(clusterId) ?? { highestStepIndex: 0, installationComplete: false })
  const [creationFailed, setCreationFailed] = useState(false)
  const [state, setState] = useState<LifecycleState>(() => progressCache.get(clusterId)?.state ?? 'idle')
  const [justSucceeded, setJustSucceeded] = useState(false)
  const [justFailed, setJustFailed] = useState(false)

  useEffect(() => {
    if (!clusterLogs || clusterLogs.length === 0) return
    let maxIndex = 0
    let isComplete = false
    let isFailed = false
    const latestTimestamp = clusterLogs[clusterLogs.length - 1]?.timestamp

    const cached = progressCache.get(clusterId) ?? { highestStepIndex: 0, installationComplete: false }
    const startSteps = new Set([
      'LoadConfiguration',
      'Create',
      'RetrieveClusterConfig',
      'RetrieveClusterResources',
      'ValidateSystemRequirements',
    ])
    const sawStartStep = clusterLogs.some((log) => log.step && startSteps.has(log.step))

    for (const log of clusterLogs) {
      const userLogMessage = (log.error as { user_log_message?: string } | undefined)?.user_log_message ?? ''
      const safeMessage = log.message?.safe_message ?? ''
      const message = userLogMessage || safeMessage
      const normalizedMessage = message.toLowerCase()

      if (normalizedMessage.includes('kubernetes cluster successfully created')) {
        maxIndex = DEPLOYMENT_STEPS.length - 1
        isComplete = true
        break
      }

      const isCreateError = log.step === 'CreateError' || normalizedMessage.includes('createerror')

      if (isCreateError) {
        isFailed = true
        break
      }

      const triggers: { index: number; match: (msg: string) => boolean }[] = [
        {
          index: DEPLOYMENT_STEPS.length - 1,
          match: (msg) => msg.includes('Check if cluster has calls to deprecated kubernetes API for version'), // last step
        },
        {
          index: 1,
          match: () => {
            if (!providerCode) return false
            return normalizedMessage.includes(`deployment ${providerCode.toLowerCase()} cluster`)
          }, // Providing infrastructure (on provider side) – name optional
        },
        {
          index: 2,
          match: (msg) =>
            msg.includes('Kubernetes nodes have been successfully created') ||
            msg.includes('Checking if Karpenter nodegroup should be deployed...') ||
            msg.includes('Ensuring all groups nodes are in ready state from the Scaleway API') ||
            msg.includes(
              'Ensuring no failed nodegroups are present in the cluster, or delete them if at least one active nodegroup is present'
            ),
        },
        {
          index: 3,
          match: (msg) => msg.includes('Preparing Helm files on disk'), // installing Qovery stack
        },
      ]

      for (const trigger of triggers) {
        if (trigger.match(message)) {
          maxIndex = Math.max(maxIndex, trigger.index)
        }
      }

      if (maxIndex === DEPLOYMENT_STEPS.length - 1) break
    }

    const baseHighest = sawStartStep ? 0 : cached.highestStepIndex
    const baseComplete = sawStartStep ? false : cached.installationComplete

    const nextHighest = Math.max(baseHighest, maxIndex)
    const nextComplete = baseComplete || isComplete

    const mergedHighest = Math.max(highestStepIndex, nextHighest)
    const mergedComplete = installationComplete || nextComplete
    const nextFailed = (sawStartStep ? false : creationFailed) || isFailed
    if (nextFailed && !creationFailed) {
      console.log('[cluster] creation failed detected', { clusterId })
    }
    const prevState = cached.state ?? state
    const nextState: LifecycleState = nextFailed
      ? 'failed'
      : mergedComplete
        ? 'succeeded'
        : sawStartStep
          ? 'installing'
          : 'idle'

    setProgress({ highestStepIndex: mergedHighest, installationComplete: mergedComplete })
    setCreationFailed(nextFailed)
    setState(nextState)
    setJustSucceeded(prevState !== 'succeeded' && nextState === 'succeeded')
    setJustFailed(prevState !== 'failed' && nextState === 'failed')

    progressCache.set(clusterId, {
      highestStepIndex: Math.max(cached.highestStepIndex, mergedHighest),
      installationComplete: cached.installationComplete || mergedComplete,
      creationFailed: (sawStartStep ? false : cached.creationFailed) || nextFailed,
      lastTimestamp: latestTimestamp ? new Date(latestTimestamp).getTime() : cached.lastTimestamp,
      state: nextState,
    })
  }, [clusterLogs, clusterId, clusterName, providerCode, creationFailed, highestStepIndex, installationComplete, state])

  const steps = useMemo(() => {
    return DEPLOYMENT_STEPS.map((label, index) => {
      if (installationComplete) {
        return { label, status: 'done' as StepStatus }
      }
      if (index < highestStepIndex) {
        return { label, status: 'done' as StepStatus }
      }
      if (index === highestStepIndex) {
        return { label, status: 'current' as StepStatus }
      }
      return { label, status: 'pending' as StepStatus }
    })
  }, [highestStepIndex, installationComplete])

  const progressValue = useMemo(() => {
    const stepsCount = DEPLOYMENT_STEPS.length
    const filledSteps = installationComplete ? stepsCount : Math.max(0, highestStepIndex)
    return Math.min(filledSteps / stepsCount, 1)
  }, [highestStepIndex, installationComplete])

  const currentStepLabel = steps[Math.min(highestStepIndex, DEPLOYMENT_STEPS.length - 1)]?.label ?? DEPLOYMENT_STEPS[0]

  return {
    steps,
    installationComplete,
    highestStepIndex,
    progressValue,
    currentStepLabel,
    creationFailed,
    state,
    justSucceeded,
    justFailed,
  }
}

export default useDeploymentProgress
