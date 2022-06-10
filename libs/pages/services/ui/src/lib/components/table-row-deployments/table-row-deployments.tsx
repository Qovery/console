import { DeploymentService } from '@console/shared/interfaces'
import {
  Avatar,
  AvatarStyle,
  ButtonIconAction,
  Icon,
  Skeleton,
  StatusChip,
  TableHeadProps,
  TableRow,
  TagCommit,
  Tooltip,
} from '@console/shared/ui'
import { timeAgo, trimId, upperCaseFirstLetter } from '@console/shared/utils'
import React, { useState } from 'react'

export interface TableRowDeploymentsProps {
  data: DeploymentService
  dataHead: TableHeadProps[]
  link: string
  columnsWidth?: string
  isLoading?: boolean
  startGroup?: boolean
}

export function TableRowDeployments(props: TableRowDeploymentsProps) {
  const {
    data,
    dataHead,
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    link,
    isLoading,
    startGroup,
  } = props

  const [copy, setCopy] = useState(false)

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-scroll" />,
    },
    {
      iconLeft: <Icon name="icon-solid-ellipsis-v" />,
    },
  ]

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    data.execution_id && navigator.clipboard.writeText(data.execution_id)
    setCopy(true)
    setTimeout(() => {
      setCopy(false)
    }, 2000)
  }

  return (
    <TableRow
      columnsWidth={columnsWidth}
      link={link}
      className={`border-b last-of-type:border-b-0 bg-white ${startGroup ? 'mt-2' : ''}`}
    >
      <>
        <div className="flex items-center px-4 gap-1">
          <Skeleton show={isLoading} width={150} height={20}>
            <Tooltip content="Copy">
              <p
                onClick={handleCopy}
                className={`text-xxs font-bold text-text-500 py-0.5 px-1 w-16 text-center rounded-sm ${
                  copy ? 'bg-success-500 text-white' : 'bg-element-light-lighter-300'
                }`}
              >
                {!copy && data.execution_id && <span>{trimId(data.execution_id)}</span>}
                {copy && <span>Copied !</span>}
              </p>
            </Tooltip>
          </Skeleton>
        </div>
        <div className="flex justify-start items-center px-4 gap-2">
          <Skeleton show={isLoading} width={20} height={20} rounded>
            <StatusChip status={data.status} />
          </Skeleton>
          <Skeleton show={isLoading} width={80} height={20}>
            <p className="text-xs text-text-400 font-medium">
              {upperCaseFirstLetter(data.status?.replace('_', ' ').toLowerCase())}
            </p>
          </Skeleton>
        </div>
        <div className="px-3">
          <Skeleton show={isLoading} width={120} height={20}>
            <div className="flex items-center">
              <div className="w-8 text-center">
                <Icon name={data.type ? data.type : 'APPLICATION'} className="w-5 h-5" />
              </div>
              <p className="text-xs text-text-600 font-medium">{data.name}</p>
            </div>
          </Skeleton>
        </div>
        <div className="flex justify-start items-center px-1 gap-2">
          <Skeleton show={isLoading} width={80} height={20}>
            <>
              <p className="flex items-center leading-7 text-text-400 text-sm">
                <span className="text-xs text-text-300 mx-3 font-medium">
                  {timeAgo(data.updated_at ? new Date(data.updated_at) : new Date(data.created_at || ''))} ago
                </span>
              </p>
              {data.name && <ButtonIconAction actions={buttonActionsDefault} />}
            </>
          </Skeleton>
        </div>
        <div className="flex items-center px-4 gap-2 border-element-light-lighter-400 border-l h-full">
          {data?.commit && (
            <>
              <Avatar
                firstName={data?.commit?.author_name}
                url={data?.commit?.author_avatar_url}
                style={AvatarStyle.STROKED}
                size={28}
              />
              <TagCommit commitId={data?.commit?.git_commit_id} />
            </>
          )}
        </div>
      </>
    </TableRow>
  )
}

export default TableRowDeployments
