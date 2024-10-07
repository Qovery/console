import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type Row } from '@tanstack/react-table'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogsType } from '@qovery/shared/enums'
import { Ansi, Icon, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { type EnvironmentLogIds } from '../../hooks/use-deployment-logs/use-deployment-logs'

const { Table } = TablePrimitives

export interface RowDeploymentLogsProps extends Row<EnvironmentLogIds> {}

export function RowDeploymentLogs({ original }: RowDeploymentLogsProps) {
  const [, copyToClipboard] = useCopyToClipboard()
  const navigate = useNavigate()
  const { pathname, hash } = useLocation()

  const [isHighlighted, setIsHighlighted] = useState(false)
  const [copyLinkIcon, setCopyLinkIcon] = useState<IconName>('link')

  const step = original.details?.stage?.step
  const type = original.type

  const success = step === 'Deployed'
  const error = type === LogsType.ERROR || step === 'DeployedError'

  const rowId = `${original.id}`

  useEffect(() => {
    const cleanHash = decodeURIComponent(hash.replace('#', ''))
    setIsHighlighted(cleanHash === rowId)
  }, [hash, rowId])

  const currentUrl = window.location.href.split('#')[0]

  return (
    <Table.Row
      id={rowId}
      className={twMerge(
        clsx('group mb-0.5 flex min-h-6 select-none bg-neutral-600 text-xs', {
          'hover:bg-neutral-550': !isHighlighted,
          'bg-neutral-550': isHighlighted,
        })
      )}
    >
      <Table.Cell className="h-6 min-w-10 py-1 pl-2 pr-1 text-left font-code font-bold text-neutral-300 group-hover:bg-neutral-550 group-hover:delay-1000">
        <Tooltip content="Copy row URL">
          <span className="relative block">
            <span className={`group-hover:opacity-0 ${isHighlighted ? 'opacity-0' : ''}`}>{original.id}</span>
            <button
              className={clsx('absolute left-0 top-0 text-sm text-neutral-50', {
                'opacity-0 group-hover:opacity-100': !isHighlighted,
                'text-purple-400': isHighlighted,
                'hover:text-purple-400': !isHighlighted,
              })}
              onClick={() => {
                setCopyLinkIcon('check')
                copyToClipboard(`${currentUrl}#${rowId}`)
                setTimeout(() => setCopyLinkIcon('link'), 1000)
                if (isHighlighted) navigate(pathname)
              }}
            >
              <Icon iconName={copyLinkIcon} iconStyle="regular" />
            </button>
          </span>
        </Tooltip>
      </Table.Cell>
      <Table.Cell className="h-fit shrink-0 py-1 pl-2 pr-3 font-code font-bold text-neutral-300">
        <span title={dateUTCString(original.timestamp)}>
          {dateFullFormat(original.timestamp, 'UTC', 'dd MMM, HH:mm:ss.SS')}
        </span>
      </Table.Cell>
      <Table.Cell
        className={clsx('relative h-fit w-full select-text overflow-hidden py-1 pl-3 pr-6 font-code font-bold', {
          'text-red-500': error,
          'text-green-500': success,
          'text-white': !error && !success,
        })}
      >
        <span className="truncate whitespace-pre-wrap break-all">
          {type === LogsType.ERROR ? (
            <Ansi>{original.error?.user_log_message}</Ansi>
          ) : (
            <Ansi>{original.message?.safe_message}</Ansi>
          )}
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default RowDeploymentLogs
