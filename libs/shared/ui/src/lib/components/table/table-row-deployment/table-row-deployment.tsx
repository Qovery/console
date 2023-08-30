import { type DeploymentHistoryApplication, type DeploymentHistoryDatabase } from 'qovery-typescript-axios'
import { type MouseEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type ContainerApplicationEntity, type DeploymentService } from '@qovery/shared/interfaces'
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
import { timeAgo } from '@qovery/shared/util-dates'
import { trimId, upperCaseFirstLetter } from '@qovery/shared/utils'
import ButtonIcon, { ButtonIconStyle } from '../../buttons/button-icon/button-icon'
import { ButtonSize } from '../../buttons/button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import Skeleton from '../../skeleton/skeleton'
import StatusChip from '../../status-chip/status-chip'
import TagCommit from '../../tag-commit/tag-commit'
import Tag from '../../tag/tag'
import Tooltip from '../../tooltip/tooltip'
import { type TableFilterProps, type TableHeadProps } from '../table'
import TableRow from '../table-row/table-row'

export interface TableRowDeploymentProps {
  dataHead: TableHeadProps<DeploymentService | DeploymentHistoryApplication | DeploymentHistoryDatabase>[]
  filter: TableFilterProps[]
  isLoading: boolean
  data?: DeploymentService | DeploymentHistoryApplication | DeploymentHistoryDatabase
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
  const { organizationId, projectId, environmentId } = useParams()
  const navigate = useNavigate()

  const pathEnvironmentLogs = ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)

  const handleCopy = (e: MouseEvent) => {
    e.preventDefault()
    setHoverId(true)
    navigator.clipboard.writeText((data as DeploymentService).execution_id || data?.id || '')
    setCopy(true)
    setTimeout(() => {
      setCopy(false)
      setHoverId(false)
    }, 2000)
  }

  return (
    <TableRow
      data={data}
      filter={filter}
      columnsWidth={columnsWidth}
      className={`border-b last-of-type:border-b-0 bg-white ${startGroup ? 'mt-2' : ''}`}
    >
      <>
        <div className="flex items-center px-4 gap-1">
          <Skeleton show={isLoading} width={150} height={20}>
            <Tooltip content="Copy">
              <p
                onClick={handleCopy}
                onMouseEnter={() => setHoverId(true)}
                onMouseLeave={() => !copy && setHoverId(false)}
                className={`text-2xs font-bold text-neutral-400 py-0.5 w-16 px-1 inline-flex gap-1 text-center rounded-sm cursor-pointer ${
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
                    {(data as DeploymentService).execution_id
                      ? trimId((data as DeploymentService).execution_id || '')
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
        <div className="flex justify-start items-center px-4 gap-2">
          <Skeleton show={isLoading} width={20} height={20} rounded>
            <StatusChip status={data?.status} />
          </Skeleton>
          <Skeleton show={isLoading} width={80} height={20}>
            <p className="text-xs text-neutral-350 font-medium">
              {upperCaseFirstLetter(data?.status?.replace('_', ' ').toLowerCase())}
            </p>
          </Skeleton>
        </div>
        {(data as DeploymentService).type && (
          <div className="px-3">
            <Skeleton show={isLoading} width={120} height={20}>
              <Link
                to={
                  (data as DeploymentService)?.type === ServiceTypeEnum.DATABASE
                    ? `${DATABASE_URL(organizationId, projectId, environmentId, data?.id) + DATABASE_GENERAL_URL}`
                    : `${APPLICATION_URL(organizationId, projectId, environmentId, data?.id) + APPLICATION_GENERAL_URL}`
                }
              >
                <div className="flex items-center">
                  <div className="w-8 text-center">
                    <Icon name={(data as DeploymentService)?.type || ServiceTypeEnum.APPLICATION} className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-neutral-400 font-medium">{data?.name}</p>
                </div>
              </Link>
            </Skeleton>
          </div>
        )}
        <div className="flex justify-start items-center px-1 gap-2">
          <Skeleton show={isLoading} width={80} height={20}>
            <>
              <p className="flex items-center leading-7 text-neutral-350 text-sm">
                <span className="text-xs text-neutral-300 mx-3 font-medium">
                  {timeAgo(data?.updated_at ? new Date(data?.updated_at) : new Date(data?.created_at || ''))} ago
                </span>
              </p>
              <ButtonIcon
                dataTestId="btn-logs"
                icon={IconAwesomeEnum.SCROLL}
                style={ButtonIconStyle.STROKED}
                size={ButtonSize.SMALL}
                onClick={() =>
                  navigate(
                    fromService
                      ? pathEnvironmentLogs + SERVICE_LOGS_URL(data?.id)
                      : pathEnvironmentLogs +
                          DEPLOYMENT_LOGS_VERSION_URL(data?.id, (data as DeploymentService).execution_id)
                  )
                }
                className="!w-7 !h-7 !border-r btn-icon-action__element"
                iconClassName="!text-2xs"
              />{' '}
            </>
          </Skeleton>
        </div>
        {!noCommit && (
          <div className="flex items-center px-4 gap-2 border-neutral-200 border-l h-full">
            {(data as DeploymentService | DeploymentHistoryApplication)?.commit && (
              <TagCommit commitId={(data as DeploymentService | DeploymentHistoryApplication)?.commit?.git_commit_id} />
            )}
            {(data as ContainerApplicationEntity).image_name && (
              <Tag className="truncate border border-neutral-250 text-neutral-350 font-medium h-7">
                <span className="block truncate">
                  <Tooltip
                    side="left"
                    content={`${(data as ContainerApplicationEntity).image_name}:${
                      (data as ContainerApplicationEntity).tag
                    }`}
                  >
                    <span>
                      {(data as ContainerApplicationEntity).image_name}:{(data as ContainerApplicationEntity).tag}
                    </span>
                  </Tooltip>
                </span>
              </Tag>
            )}
          </div>
        )}
      </>
    </TableRow>
  )
}

export default TableRowDeployment
