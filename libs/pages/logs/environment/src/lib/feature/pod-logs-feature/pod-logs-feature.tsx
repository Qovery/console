import clsx from 'clsx'
import { Link, useLocation, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { ListServiceLogs } from '@qovery/domains/service-logs/feature'
import { ServiceStateChip, useService } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export interface PodLogsFeatureProps {
  clusterId: string
}

function LinkLogs({ title, url, statusChip = true }: { title: string; url: string; statusChip?: boolean }) {
  const { environmentId = '', serviceId = '' } = useParams()
  const location = useLocation()

  const isActive = location.pathname.includes(url)
  return (
    <Link
      className={clsx(
        'transition-timing duration-250 flex h-11 items-center rounded-t px-6 text-sm font-medium text-neutral-50 transition-colors hover:bg-neutral-700',
        {
          'bg-neutral-650': isActive,
        }
      )}
      to={url}
    >
      {statusChip && (
        <ServiceStateChip className="mr-2" mode="running" environmentId={environmentId} serviceId={serviceId} />
      )}

      <span className="truncate">{title}</span>
    </Link>
  )
}

export function PodLogsFeature({ clusterId }: PodLogsFeatureProps) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams()
  const { data: service } = useService({ environmentId, serviceId })

  useDocumentTitle(`Service logs ${service ? `- ${service?.name}` : '- Loading...'}`)

  return (
    <div className="w-full">
      <div className="flex w-full items-center overflow-y-auto bg-neutral-900 px-1 pt-1">
        <LinkLogs
          title="Deployment logs"
          url={ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(serviceId)}
          statusChip={false}
        />
        <LinkLogs
          title="Service logs"
          url={ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId)}
          statusChip={match(service)
            .with({ serviceType: 'DATABASE' }, (db) => db.mode === 'CONTAINER')
            .otherwise(() => true)}
        />
      </div>
      <ListServiceLogs clusterId={clusterId} />
    </div>
  )
}

export default PodLogsFeature
