import { ServicesEnum } from '@console/shared/enums'
import { DeploymentService } from '@console/shared/interfaces'
import { APPLICATION_GENERAL_URL, APPLICATION_URL } from '@console/shared/router'
import {
  Avatar,
  AvatarStyle,
  ButtonIconAction,
  Skeleton,
  StatusChip,
  TableRow,
  TagCommit,
  Tooltip,
} from '@console/shared/ui'
import { renameStatus, timeAgo, trimId, upperCaseFirstLetter } from '@console/shared/utils'
import { DeploymentHistoryApplication, DeploymentHistoryDatabase } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import Icon from '../../icon/icon'
import { TableHeadProps } from '../table'

export interface TableRowDeploymentProps {
  data?: DeploymentService | DeploymentHistoryApplication | DeploymentHistoryDatabase
  dataHead: TableHeadProps[]
  columnsWidth?: string
  isLoading?: boolean
  startGroup?: boolean
}

export function TableRowDeployment(props: TableRowDeploymentProps) {
  const { dataHead, columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`, isLoading, startGroup, data } = props

  const [copy, setCopy] = useState(false)
  const [hoverId, setHoverId] = useState(false)
  const { organizationId, projectId, environmentId } = useParams()

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-scroll" />,
      onClick: () =>
        window
          .open(
            `https://console.qovery.com/platform/organization/${organizationId}/projects/${projectId}/environments/${environmentId}/applications/${
              (data as DeploymentService).id
            }/summary?fullscreenLogs=true`,
            '_blank'
          )
          ?.focus(),
    },
    /*{
      iconLeft: <Icon name="icon-solid-ellipsis-v" />,
    },*/
  ]

  const handleCopy = (e: React.MouseEvent) => {
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
                className={`text-xxs font-bold text-text-500 py-0.5 w-16 px-1 inline-flex gap-1 text-center rounded-sm cursor-pointer ${
                  copy ? 'bg-success-500 text-white' : 'bg-element-light-lighter-300'
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
            <p className="text-xs text-text-400 font-medium">
              {upperCaseFirstLetter(renameStatus(data?.status)?.replace('_', ' ').toLowerCase())}
            </p>
          </Skeleton>
        </div>
        {(data as DeploymentService).type && (
          <div className="px-3">
            <Skeleton show={isLoading} width={120} height={20}>
              <Link to={APPLICATION_URL(organizationId, projectId, environmentId, data?.id) + APPLICATION_GENERAL_URL}>
                <div className="flex items-center">
                  <div className="w-8 text-center">
                    <Icon name={(data as DeploymentService)?.type || ServicesEnum.APPLICATION} className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-text-600 font-medium">{data?.name}</p>
                </div>
              </Link>
            </Skeleton>
          </div>
        )}
        <div className="flex justify-start items-center px-1 gap-2">
          <Skeleton show={isLoading} width={80} height={20}>
            <>
              <p className="flex items-center leading-7 text-text-400 text-sm">
                <span className="text-xs text-text-300 mx-3 font-medium">
                  {timeAgo(data?.updated_at ? new Date(data?.updated_at) : new Date(data?.created_at || ''))} ago
                </span>
              </p>
              {data?.name && <ButtonIconAction actions={buttonActionsDefault} />}
            </>
          </Skeleton>
        </div>
        <div className="flex items-center px-4 gap-2 border-element-light-lighter-400 border-l h-full">
          {(data as DeploymentService | DeploymentHistoryApplication)?.commit && (
            <>
              <Avatar
                firstName={(data as DeploymentService | DeploymentHistoryApplication)?.commit?.author_name || ''}
                url={(data as DeploymentService | DeploymentHistoryApplication)?.commit?.author_avatar_url}
                style={AvatarStyle.STROKED}
                size={28}
              />
              <TagCommit commitId={(data as DeploymentService | DeploymentHistoryApplication)?.commit?.git_commit_id} />
            </>
          )}
        </div>
      </>
    </TableRow>
  )
}

export default TableRowDeployment
