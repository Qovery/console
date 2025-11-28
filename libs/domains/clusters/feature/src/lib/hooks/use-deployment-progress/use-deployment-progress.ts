import { useEffect, useMemo, useState } from 'react'
import { useClusterLogs } from '@qovery/domains/clusters/feature'

export type StepStatus = 'current' | 'pending' | 'done'

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

  const [{ highestStepIndex, installationComplete }, setProgress] = useState<{
    highestStepIndex: number
    installationComplete: boolean
  }>({ highestStepIndex: 0, installationComplete: false })

  useEffect(() => {
    if (!clusterLogs || clusterLogs.length === 0) return
    let maxIndex = 0
    let isComplete = false

    for (const log of clusterLogs) {
      const message =
        (log.error as { user_log_message?: string } | undefined)?.user_log_message ?? log.message?.safe_message ?? ''
      if (!message) continue

      if (message.includes('Kubernetes cluster successfully created')) {
        maxIndex = DEPLOYMENT_STEPS.length - 1
        isComplete = true
        break
      }

      const triggers: { index: number; match: (msg: string) => boolean }[] = [
        {
          index: DEPLOYMENT_STEPS.length - 1,
          match: (msg) => msg.includes('Check if cluster has calls to deprecated kubernetes API for version'),
        },
        {
          index: 1,
          match: (msg) =>
            Boolean(clusterName && providerCode && msg.includes(`Deployment ${providerCode} cluster ${clusterName}`)),
        },
        {
          index: 2,
          match: (msg) => msg.includes('Saved the plan to: tf_plan'),
        },
        {
          index: 3,
          match: (msg) => msg.includes('Preparing Helm files on disk'),
        },
      ]

      for (const trigger of triggers) {
        if (trigger.match(message)) {
          maxIndex = Math.max(maxIndex, trigger.index)
        }
      }

      if (maxIndex === DEPLOYMENT_STEPS.length - 1) break
    }

    setProgress((prev) => ({
      highestStepIndex: Math.max(prev.highestStepIndex, maxIndex),
      installationComplete: prev.installationComplete || isComplete,
    }))
  }, [clusterLogs, clusterName, providerCode])

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
  }
}

export default useDeploymentProgress
