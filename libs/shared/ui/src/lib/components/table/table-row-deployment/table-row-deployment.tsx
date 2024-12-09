import {
  type DeploymentHistoryApplication,
  type DeploymentHistoryDatabase,
  type DeploymentHistoryHelmResponse,
} from 'qovery-typescript-axios'
import { type MouseEvent, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { type Container } from '@qovery/domains/services/data-access'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type DeploymentServiceLegacy } from '@qovery/shared/interfaces'
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  APPLICATION_GENERAL_URL,
  APPLICATION_URL,
  DATABASE_GENERAL_URL,
  DATABASE_URL,
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { trimId, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { Badge } from '../../badge/badge'
import Icon from '../../icon/icon'
import { Link } from '../../link/link'
import Skeleton from '../../skeleton/skeleton'
import StatusChip from '../../status-chip/status-chip'
import TagCommit from '../../tag-commit/tag-commit'
import Tooltip from '../../tooltip/tooltip'
import { type TableFilterProps, type TableHeadProps } from '../table'
import TableRow from '../table-row/table-row'

export interface TableRowDeploymentProps {
  dataHead: TableHeadProps<DeploymentServiceLegacy | DeploymentHistoryApplication | DeploymentHistoryDatabase>[]
  filter: TableFilterProps[]
  isLoading: boolean
  data?:
    | DeploymentServiceLegacy
    | DeploymentHistoryApplication
    | DeploymentHistoryDatabase
    | DeploymentHistoryHelmResponse
  columnsWidth?: string
  startGroup?: boolean
  noCommit?: boolean
  fromService?: boolean
}

/**
 * @deprecated Prefer TablePrimitives + tanstack-table for type-safety and documentation
 */
export function TableRowDeployment({
  dataHead,
  columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
  isLoading,
  startGroup,
  data,
  noCommit,
  filter,
  fromService,
}: TableRowDeploymentProps) {
  const [copy, setCopy] = useState(false)
  const [hoverId, setHoverId] = useState(false)
  const { organizationId, projectId, environmentId, applicationId, databaseId } = useParams()

  const pathEnvironmentLogs = ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)

  const handleCopy = (e: MouseEvent) => {
    e.preventDefault()
    setHoverId(true)
    navigator.clipboard.writeText((data as DeploymentServiceLegacy).execution_id || data?.id || '')
    setCopy(true)
    setTimeout(() => {
      setCopy(false)
      setHoverId(false)
    }, 2000)
  }

  const serviceId = applicationId || databaseId || data?.id

  return (
    <TableRow
      data={data}
      filter={filter}
      columnsWidth={columnsWidth}
      className={`border-b bg-white last-of-type:border-b-0 ${startGroup ? 'mt-2' : ''}`}
    >
      <>
        <div className="flex items-center gap-1 px-4">
          <Skeleton show={isLoading} width={150} height={20}>
            <Tooltip content="Copy">
              <p
                onClick={handleCopy}
                onMouseEnter={() => setHoverId(true)}
                onMouseLeave={() => !copy && setHoverId(false)}
                className={`inline-flex w-16 cursor-pointer gap-1 rounded-sm px-1 py-0.5 text-center text-2xs font-bold text-neutral-400 ${
                  copy ? 'bg-green-500 text-white' : 'bg-neutral-150'
                }`}
              >
                {hoverId && !copy && (
                  <span className="inline-flex gap-1.5">
                    <Icon name="icon-solid-copy" />
                    <span>Copy ID</span>
                  </span>
                )}
                {!copy && !hoverId && (
                  <span>
                    {(data as DeploymentServiceLegacy).execution_id
                      ? trimId((data as DeploymentServiceLegacy).execution_id || '')
                      : trimId(data?.id || '')}
                  </span>
                )}
                {copy && (
                  <div className="inline-flex gap-1.5">
                    <Icon name="icon-solid-copy" />
                    <span>Copied !</span>
                  </div>
                )}
              </p>
            </Tooltip>
          </Skeleton>
        </div>
        <div className="flex items-center justify-start gap-2 px-4">
          <Skeleton show={isLoading} width={20} height={20} rounded>
            <StatusChip status={data?.status} />
          </Skeleton>
          <Skeleton show={isLoading} width={80} height={20}>
            <p className="text-xs font-medium text-neutral-350">
              {upperCaseFirstLetter(data?.status?.replace('_', ' ').toLowerCase())}
            </p>
          </Skeleton>
        </div>
        {(data as DeploymentServiceLegacy).type && (
          <div className="px-3">
            <Skeleton show={isLoading} width={120} height={20}>
              <RouterLink
                to={
                  (data as DeploymentServiceLegacy)?.type === ServiceTypeEnum.DATABASE
                    ? `${DATABASE_URL(organizationId, projectId, environmentId, data?.id) + DATABASE_GENERAL_URL}`
                    : `${APPLICATION_URL(organizationId, projectId, environmentId, data?.id) + APPLICATION_GENERAL_URL}`
                }
              >
                <div className="flex items-center">
                  <div className="w-8 text-center">
                    <Icon
                      name={(data as DeploymentServiceLegacy)?.type || ServiceTypeEnum.APPLICATION}
                      className="h-5 w-5"
                    />
                  </div>
                  <p className="text-xs font-medium text-neutral-400">{data?.name}</p>
                </div>
              </RouterLink>
            </Skeleton>
          </div>
        )}
        <div className="flex items-center justify-start gap-2 px-1">
          <Skeleton show={isLoading} width={80} height={20}>
            <>
              <p className="flex items-center text-sm leading-7 text-neutral-350">
                <Tooltip
                  content={
                    data?.updated_at ? dateUTCString(data.updated_at) : dateUTCString(data?.created_at ?? Date.now())
                  }
                >
                  <span className="mx-3 text-xs font-medium text-neutral-300">
                    {timeAgo(data?.updated_at ? new Date(data?.updated_at) : new Date(data?.created_at || ''))} ago
                  </span>
                </Tooltip>
              </p>
              <Link
                as="button"
                data-testid="btn-logs"
                variant="outline"
                color="neutral"
                size="md"
                to={
                  fromService
                    ? pathEnvironmentLogs + DEPLOYMENT_LOGS_VERSION_URL(serviceId, (data as DeploymentServiceLegacy).id)
                    : pathEnvironmentLogs +
                      DEPLOYMENT_LOGS_VERSION_URL(serviceId, (data as DeploymentServiceLegacy).execution_id)
                }
              >
                <Icon iconName="scroll" />
              </Link>
            </>
          </Skeleton>
        </div>
        {!noCommit && (
          <div className="flex h-full items-center gap-2 border-l border-neutral-200 px-4">
            {(data as DeploymentServiceLegacy | DeploymentHistoryApplication)?.commit && (
              <TagCommit
                commitId={(data as DeploymentServiceLegacy | DeploymentHistoryApplication)?.commit?.git_commit_id}
              />
            )}
            {(data as Container).image_name && (
              <Badge className="max-w-[200px] truncate">
                <span className="block truncate">
                  <Tooltip side="left" content={`${(data as Container).image_name}:${(data as Container).tag}`}>
                    <span>
                      {(data as Container).image_name}:{(data as Container).tag}
                    </span>
                  </Tooltip>
                </span>
              </Badge>
            )}
            {(data as DeploymentHistoryHelmResponse).repository && (
              <Badge className="max-w-[200px] truncate">
                <span className="block truncate">
                  <Tooltip
                    side="left"
                    content={`${(data as DeploymentHistoryHelmResponse).repository?.chart_name}:${
                      (data as DeploymentHistoryHelmResponse).repository?.chart_version
                    }`}
                  >
                    <span>
                      {(data as DeploymentHistoryHelmResponse).repository?.chart_name}:
                      {(data as DeploymentHistoryHelmResponse).repository?.chart_version}
                    </span>
                  </Tooltip>
                </span>
              </Badge>
            )}
          </div>
        )}
      </>
    </TableRow>
  )
}

export default TableRowDeployment
