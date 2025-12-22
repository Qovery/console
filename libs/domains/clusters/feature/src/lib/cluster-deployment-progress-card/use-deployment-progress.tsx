import { useMemo } from 'react'
import { useClusterLogs } from '../hooks/use-cluster-logs/use-cluster-logs'

// XXX: This code need to be refactored and improved
// From https://github.com/Qovery/console/pull/2176

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

export function useDeploymentProgress({ organizationId, clusterId, cloudProvider }: UseDeploymentProgressProps): {
  steps: { label: string; status: StepStatus }[]
  progressValue: number
  currentStepLabel: string
  state: LifecycleState
} {
  const { data: clusterLogs } = useClusterLogs({
    organizationId,
    clusterId,
    refetchInterval: 3000,
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

  const { highestStepIndex, installationComplete, state } = useMemo(() => {
    if (!clusterLogs || clusterLogs.length === 0) {
      return { highestStepIndex: 0, installationComplete: false, state: 'idle' as LifecycleState }
    }

    const startSteps = new Set([
      'LoadConfiguration',
      'Create',
      'RetrieveClusterConfig',
      'RetrieveClusterResources',
      'ValidateSystemRequirements',
    ])
    const hasStarted = clusterLogs.some((log) => log.step && startSteps.has(log.step))

    let maxIndex = 0
    let isComplete = false
    let isFailed = false

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

      if (log.step === 'CreateError' || normalizedMessage.includes('createerror')) {
        isFailed = true
        break
      }

      if (message.includes('Check if cluster has calls to deprecated kubernetes API for version')) {
        maxIndex = Math.max(maxIndex, DEPLOYMENT_STEPS.length - 1)
      }
      if (providerCode && normalizedMessage.includes(`deployment ${providerCode.toLowerCase()} cluster`)) {
        maxIndex = Math.max(maxIndex, 1)
      }
      if (
        message.includes('Kubernetes nodes have been successfully created') ||
        message.includes('Checking if Karpenter nodegroup should be deployed...') ||
        message.includes('Ensuring all groups nodes are in ready state from the Scaleway API') ||
        message.includes(
          'Ensuring no failed nodegroups are present in the cluster, or delete them if at least one active nodegroup is present'
        )
      ) {
        maxIndex = Math.max(maxIndex, 2)
      }
      if (message.includes('Preparing Helm files on disk')) {
        maxIndex = Math.max(maxIndex, 3)
      }

      if (maxIndex === DEPLOYMENT_STEPS.length - 1) break
    }

    const computedState: LifecycleState = isFailed
      ? 'failed'
      : isComplete
        ? 'succeeded'
        : hasStarted
          ? 'installing'
          : 'idle'

    return {
      highestStepIndex: maxIndex,
      installationComplete: isComplete,
      state: computedState,
    }
  }, [clusterLogs, providerCode])

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
    progressValue,
    currentStepLabel,
    state,
  }
}

export default useDeploymentProgress
