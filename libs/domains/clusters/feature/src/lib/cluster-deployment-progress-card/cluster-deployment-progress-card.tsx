import * as AccordionPrimitive from '@radix-ui/react-accordion'
import clsx from 'clsx'
import { type Cluster, type Project } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { useProjects } from '@qovery/domains/projects/feature'
import { INFRA_LOGS_URL, OVERVIEW_URL } from '@qovery/shared/routes'
import { AnimatedGradientText, Icon, Link } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useDeploymentProgress } from './use-deployment-progress'

export interface ClusterDeploymentProgressCardProps {
  organizationId: string
  clusters: Cluster[]
}

export function ClusterDeploymentProgressCard({ organizationId, clusters }: ClusterDeploymentProgressCardProps) {
  const { data: projects = [] } = useProjects({ organizationId })

  if (!clusters.length) return null

  return (
    <div className="fixed bottom-[80px] right-4 w-96 max-w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-md">
      <AccordionPrimitive.Root type="multiple" className="w-full">
        {clusters.map((cluster) => (
          <Item key={cluster.id} cluster={cluster} project={projects[0]} />
        ))}
      </AccordionPrimitive.Root>
    </div>
  )
}

function Item({ cluster, project }: { cluster: Cluster; project: Project }) {
  const { steps, progressValue, currentStepLabel, state } = useDeploymentProgress({
    organizationId: cluster.organization.id,
    clusterId: cluster.id,
    clusterName: cluster.name,
    cloudProvider: cluster.cloud_provider,
  })

  const { link, label } = match(state)
    .with('failed', () => ({
      link: INFRA_LOGS_URL(cluster.organization.id, cluster.id),
      label: 'See logs' as const,
    }))
    .with('succeeded', () =>
      project
        ? {
            link: OVERVIEW_URL(cluster.organization.id, project.id),
            label: 'Start deploying' as const,
          }
        : { link: undefined, label: undefined }
    )
    .otherwise(() => ({ link: undefined, label: undefined }))

  const isInstalling = state === 'installing'
  const isFailed = state === 'failed'
  const isSucceeded = state === 'succeeded'
  const isDone = isFailed || isSucceeded

  const statusText = match(state)
    .with('failed', () => 'creation failed')
    .with('succeeded', () => 'created')
    .otherwise(() => '')

  if (isInstalling && !isDone) {
    return (
      <AccordionPrimitive.Item
        value={cluster.id}
        className="overflow-hidden border-0 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-neutral-200"
      >
        <AccordionPrimitive.Trigger className="group relative flex w-full items-center justify-between gap-4 overflow-hidden bg-white p-4 text-sm shadow-sm outline-none [&:only-child]:rounded-xl">
          <div className="flex shrink-0 items-center gap-2 text-neutral-400">
            <span aria-hidden="true" className="inline-flex h-[14px] w-[14px] items-center justify-center">
              <svg
                className="relative top-[1px] -rotate-90"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                role="presentation"
              >
                <circle
                  cx="7"
                  cy="7"
                  r={6.25}
                  stroke="var(--color-neutral-200)"
                  strokeWidth={1.5}
                  fill="none"
                  strokeLinecap="round"
                />
                <circle
                  cx="7"
                  cy="7"
                  r={6.25}
                  stroke="var(--color-brand-500)"
                  strokeWidth={1.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 6.25}
                  strokeDashoffset={2 * Math.PI * 6.25 * (1 - progressValue)}
                  className="transition-[stroke-dashoffset] duration-300 ease-out"
                />
              </svg>
            </span>
            <span className="truncate">{cluster.name}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="min-w-0 overflow-hidden">
              <AnimatedGradientText className="block w-full truncate from-neutral-300 via-neutral-350 to-neutral-300 text-left text-ssm">
                {currentStepLabel}
              </AnimatedGradientText>
            </span>
            <Icon
              iconName="chevron-down"
              iconStyle="regular"
              className="text-xs text-neutral-350 transition-transform duration-200 ease-[cubic-bezier(0.87,_0,_0.13,_1)]  group-hover:text-neutral-400 group-data-[state=open]:rotate-180"
            />
          </div>
        </AccordionPrimitive.Trigger>
        <AccordionPrimitive.Content className="data-[state=closed]:slidein-up-sm-faded overflow-hidden bg-neutral-100 px-4 py-3 text-ssm data-[state=open]:animate-slidein-down-sm-faded">
          <ul className="flex flex-col gap-2">
            {steps.map(({ label, status }) => (
              <li key={label} className="flex items-center gap-2">
                {status === 'done' && <Icon iconName="check-circle" iconStyle="regular" className="text-neutral-350" />}
                {status === 'current' && (
                  <Icon iconName="loader" iconStyle="regular" className="animate-spin text-neutral-400" />
                )}
                {status === 'pending' && <Icon iconName="circle" iconStyle="regular" className="text-neutral-300" />}
                <span
                  className={twMerge(
                    clsx(
                      status === 'done' && 'text-neutral-350',
                      status === 'current' && 'text-neutral-400',
                      status === 'pending' && 'text-neutral-300'
                    )
                  )}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Link
              to={INFRA_LOGS_URL(cluster.organization.id, cluster.id)}
              size="ssm"
              color="current"
              className="inline-flex items-center gap-1 font-medium text-neutral-350 hover:text-neutral-400"
            >
              See cluster logs
              <Icon iconName="chevron-right" iconStyle="regular" className="text-xs" />
            </Link>
          </div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    )
  }

  return (
    <div className="[&:not(:last-child)]:border-b [&:not(:last-child)]:border-neutral-200">
      <div className="relative flex w-full items-center justify-between gap-4 overflow-hidden bg-white p-4 text-sm shadow-sm [&:only-child]:rounded-xl">
        <div className="flex shrink-0 items-center gap-2 text-neutral-400">
          {isSucceeded && <Icon iconName="check-circle" iconStyle="regular" className="text-green-500" />}
          {isFailed && <Icon iconName="circle-xmark" iconStyle="regular" className="text-red-500" />}
          {!isSucceeded && !isFailed && !isInstalling && (
            <Icon iconName="clock" iconStyle="regular" className="text-neutral-350" />
          )}
          <span className="truncate">
            {cluster.name} {statusText}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          {link && label && (
            <Link to={link} size="ssm" color="current" className="text-neutral-350 hover:text-neutral-400">
              {label}
              <Icon iconName="chevron-right" iconStyle="regular" />
            </Link>
          )}
          {!isSucceeded && !isFailed && !isInstalling && (
            <p className="text-ssm text-neutral-350">Deployment queued…</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClusterDeploymentProgressCard
