import { useParams } from '@tanstack/react-router'
import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { P, match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { isHelmGitSource, isJobGitSource } from '@qovery/shared/enums'
import {
  Button,
  CopyToClipboard,
  DeploymentAction,
  EmptyState,
  Icon,
  Skeleton,
  StatusChip,
  Tooltip,
} from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { useDeploymentHistory } from '../../hooks/use-deployment-history/use-deployment-history'
import { LastCommitAuthor, type LastCommitAuthorProps } from '../../last-commit-author/last-commit-author'
import { LastCommit, type LastCommitProps } from '../../last-commit/last-commit'
import { isDeploymentHistory } from '../../service-deployment-list/service-deployment-list'

const DotSeparator = () => (
  <svg
    className="text-neutral-disabled"
    xmlns="http://www.w3.org/2000/svg"
    width="3"
    height="3"
    fill="none"
    viewBox="0 0 3 3"
  >
    <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
  </svg>
)

function getGitRepository(service: AnyService): ApplicationGitRepository | undefined {
  return match(service)
    .with({ serviceType: 'APPLICATION' }, ({ git_repository }) => git_repository)
    .with({ serviceType: 'JOB', source: P.when(isJobGitSource) }, ({ source }) => source.docker?.git_repository)
    .with({ serviceType: 'HELM', source: P.when(isHelmGitSource) }, ({ source }) => source.git?.git_repository)
    .with({ serviceType: 'TERRAFORM' }, ({ terraform_files_source }) => terraform_files_source?.git?.git_repository)
    .otherwise(() => undefined)
}

export interface ServiceLastDeploymentProps {
  serviceId: string
  serviceType: Parameters<typeof useDeploymentHistory>[0]['serviceType']
  service?: AnyService
}
export function ServiceLastDeploymentSkeleton() {
  return (
    <div className="flex gap-2.5 rounded-lg border border-neutral bg-surface-neutral px-5 py-4">
      <Skeleton width={100} height={16} />
      <Skeleton width={100} height={16} />
      <Skeleton width={150} height={16} />
    </div>
  )
}

function ServiceLastDeploymentContent({ serviceId, serviceType, service }: ServiceLastDeploymentProps) {
  const { organizationId = '', projectId = '' } = useParams({ strict: false })
  const { data: deploymentHistory = [] } = useDeploymentHistory({
    serviceId,
    serviceType,
    suspense: true,
  })

  const lastDeployment = deploymentHistory[0]
  const gitRepository = service ? getGitRepository(service) : undefined
  const showGitCommit =
    Boolean(gitRepository) &&
    Boolean(service?.id && service?.name && service?.serviceType && 'environment' in service && service.environment)

  if (!lastDeployment) {
    return (
      <EmptyState
        icon="play"
        iconStyle="solid"
        title="Application has never been deployed"
        description="Deploy the application first"
      >
        <Button className="gap-1" color="neutral" variant="outline" size="md">
          <Icon iconName="rocket" />
          Deploy now
        </Button>
      </EmptyState>
    )
  }

  const versionPill = isDeploymentHistory(lastDeployment)
    ? match(lastDeployment.details)
        .with({ repository: P.select({ chart_name: P.string, chart_version: P.string }) }, ({ chart_version }) => (
          <Tooltip content={`Chart version: ${chart_version}`}>
            <Button type="button" variant="surface" color="neutral" size="xs" className="gap-1">
              <Icon iconName="code-commit" className="w-4" />
              {chart_version.length >= 18 ? `${chart_version.slice(0, 15)}…` : chart_version}
            </Button>
          </Tooltip>
        ))
        .with({ image_name: P.string, tag: P.string }, ({ tag }) => (
          <Tooltip content={`Image tag: ${tag}`}>
            <CopyToClipboard text={tag} className="inline-flex justify-center">
              <Button type="button" variant="surface" color="neutral" size="xs" className="gap-1">
                <Icon iconName="code-commit" className="w-4" />
                {tag.length >= 8 ? `${tag.slice(0, 8)}…` : tag}
              </Button>
            </CopyToClipboard>
          </Tooltip>
        ))
        .otherwise(() => null)
    : null

  const gitBlock =
    showGitCommit && gitRepository && service ? (
      <span className="pointer-events-auto inline-flex items-center gap-2.5">
        <DotSeparator />
        <span className="flex items-center gap-2.5">
          <LastCommit
            organizationId={organizationId}
            projectId={projectId}
            gitRepository={gitRepository}
            service={service as LastCommitProps['service']}
          />
          {'created_at' in (lastDeployment.auditing_data ?? {}) && lastDeployment.auditing_data.created_at && (
            <>
              <DotSeparator />
              <span className="text-neutral-subtle">
                Lasted{' '}
                <Tooltip content={dateUTCString(lastDeployment.auditing_data.created_at)}>
                  <span>{timeAgo(new Date(lastDeployment.auditing_data.created_at))}</span>
                </Tooltip>
              </span>
            </>
          )}
          <DotSeparator />
          <LastCommitAuthor
            gitRepository={gitRepository}
            serviceId={service.id}
            serviceType={service.serviceType as LastCommitAuthorProps['serviceType']}
            size={20}
            withFullName
          />
        </span>
      </span>
    ) : null

  return (
    <div className="flex rounded-lg border border-neutral bg-surface-neutral px-5 py-4">
      <div className="flex flex-wrap items-center gap-2.5 text-sm text-neutral">
        <span className="font-medium">
          <DeploymentAction status={lastDeployment.status_details.status} />
        </span>
        <StatusChip status={lastDeployment.status_details.status} />
        {showGitCommit ? (
          gitBlock
        ) : versionPill ? (
          <>
            <DotSeparator />
            {versionPill}
          </>
        ) : null}
      </div>
    </div>
  )
}

export function ServiceLastDeployment(props: ServiceLastDeploymentProps) {
  return (
    <Suspense fallback={<ServiceLastDeploymentSkeleton />}>
      <ServiceLastDeploymentContent {...props} />
    </Suspense>
  )
}
