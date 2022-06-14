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
import { timeAgo, trimId, upperCaseFirstLetter } from '@console/shared/utils'
import { Commit, DeploymentHistoryApplication, DeploymentHistoryDatabase, StateEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import Icon from '../../icon/icon'
import { TableHeadProps } from '../table'

export interface TableRowDeploymentProps {
  dataHead: TableHeadProps[]
  columnsWidth?: string
  isLoading?: boolean
  startGroup?: boolean
  execution_id: string
  status?: StateEnum
  service?: { name?: string; type?: 'APPLICATION' | 'DATABASE'; id?: string }
  created_at?: string
  updated_at?: string
  commit?: Commit
}

export function TableRowDeployment(props: TableRowDeploymentProps) {
  const {
    dataHead,
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    isLoading,
    startGroup,
    execution_id,
    status,
    service,
    created_at,
    updated_at,
    commit,
  } = props

  const [copy, setCopy] = useState(false)
  const [hoverId, setHoverId] = useState(false)
  const { organizationId, projectId, environmentId } = useParams()

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-scroll" />,
      onClick: () =>
        window
          .open(
            `https://console.qovery.com/platform/organization/${organizationId}/projects/${projectId}/environments/${environmentId}/applications/${service?.id}/summary?fullscreenLogs=true`,
            '_blank'
          )
          ?.focus(),
    },
    {
      iconLeft: <Icon name="icon-solid-ellipsis-v" />,
    },
  ]

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    setHoverId(true)
    navigator.clipboard.writeText(execution_id)
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
                {!copy && !hoverId && <span>{trimId(execution_id)}</span>}
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
            <StatusChip status={status} />
          </Skeleton>
          <Skeleton show={isLoading} width={80} height={20}>
            <p className="text-xs text-text-400 font-medium">
              {upperCaseFirstLetter(status?.replace('_', ' ').toLowerCase())}
            </p>
          </Skeleton>
        </div>
        {service && service?.name && (
          <div className="px-3">
            <Skeleton show={isLoading} width={120} height={20}>
              <Link
                to={APPLICATION_URL(organizationId, projectId, environmentId, service.id) + APPLICATION_GENERAL_URL}
              >
                <div className="flex items-center">
                  <div className="w-8 text-center">
                    <Icon name={service.type ? service.type : 'APPLICATION'} className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-text-600 font-medium">{service.name}</p>
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
                  {timeAgo(updated_at ? new Date(updated_at) : new Date(created_at || ''))} ago
                </span>
              </p>
              {service?.name && <ButtonIconAction actions={buttonActionsDefault} />}
            </>
          </Skeleton>
        </div>
        <div className="flex items-center px-4 gap-2 border-element-light-lighter-400 border-l h-full">
          {commit && (
            <>
              <Avatar
                firstName={commit?.author_name}
                url={commit?.author_avatar_url}
                style={AvatarStyle.STROKED}
                size={28}
              />
              <TagCommit commitId={commit?.git_commit_id} />
            </>
          )}
        </div>
      </>
    </TableRow>
  )
}

export default TableRowDeployment
