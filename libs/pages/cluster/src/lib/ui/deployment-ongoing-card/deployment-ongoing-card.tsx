import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useClusterLogs } from '@qovery/domains/clusters/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { INFRA_LOGS_URL } from '@qovery/shared/routes'
import { OVERVIEW_URL } from '@qovery/shared/routes'
import { Icon, Link } from '@qovery/shared/ui'

export interface DeploymentOngoingCardProps {
  organizationId: string
  clusterId: string
  clusterName?: string
  cloudProvider?: string
}

type StepStatus = 'current' | 'pending' | 'done'

const DEPLOYMENT_STEPS = [
  'Validating config',
  'Providing infra (on provider side)',
  'Verifying provided infra',
  'Installing Qovery stack',
  'Verifying kube deprecation API calls',
]

export function DeploymentOngoingCard({
  organizationId,
  clusterId,
  clusterName,
  cloudProvider,
}: DeploymentOngoingCardProps) {
  const { pathname } = useLocation()
  const { data: clusterLogs } = useClusterLogs({
    organizationId,
    clusterId,
    refetchInterval: 3000,
  })
  const { data: projects = [] } = useProjects({ organizationId, enabled: !!organizationId })

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

  const deploymentLink =
    installationComplete && projects[0]
      ? OVERVIEW_URL(organizationId, projects[0].id)
      : INFRA_LOGS_URL(organizationId, clusterId)
  const deploymentLinkLabel = installationComplete && projects[0] ? 'Start deploying' : 'Cluster logs'

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-100 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-b border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
          {installationComplete ? (
            <>
              <Icon iconName="check-circle" iconStyle="regular" className="text-green-500" />
              Cluster installed!
            </>
          ) : (
            <>
              <span aria-hidden="true" className="inline-flex h-[14px] w-[14px] items-center justify-center">
                <svg className="-rotate-90" width="14" height="14" viewBox="0 0 14 14" role="presentation">
                  <circle cx="7" cy="7" r={6.25} stroke="#E5E7EB" strokeWidth={1.5} fill="none" strokeLinecap="round" />
                  <circle
                    cx="7"
                    cy="7"
                    r={6.25}
                    stroke="#5A4BFF"
                    strokeWidth={1.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 6.25}
                    strokeDashoffset={2 * Math.PI * 6.25 * (1 - progressValue)}
                    className="transition duration-150 ease-in-out"
                  />
                </svg>
              </span>
              Deployment ongoing
            </>
          )}
        </div>
        <div className="text-neutral-350">
          <Link to={deploymentLink} state={{ prevUrl: pathname }} size="ssm" color="current">
            {deploymentLinkLabel}
            <Icon iconName="chevron-right" iconStyle="regular" />
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 p-4 text-ssm" role="list">
        {steps.map(({ label, status }, index) => (
          <div key={label} className="flex items-center" role="listitem">
            {status === 'done' && (
              <Icon iconName="check-circle" iconStyle="regular" className="mr-2 text-ssm text-neutral-350" />
            )}
            {status === 'current' && (
              <Icon iconName="loader" iconStyle="regular" className="mr-2 animate-spin text-ssm text-neutral-400" />
            )}
            {status === 'pending' && (
              <Icon iconName="circle" iconStyle="regular" className="mr-2 text-ssm text-neutral-300" />
            )}
            <span
              className={
                status === 'done'
                  ? 'mr-3 text-neutral-350'
                  : status === 'current'
                    ? 'mr-3 text-neutral-400'
                    : 'mr-3 text-neutral-300'
              }
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <span className={status === 'done' ? 'text-neutral-350' : 'text-neutral-300'} aria-hidden>
                ⸺
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeploymentOngoingCard
