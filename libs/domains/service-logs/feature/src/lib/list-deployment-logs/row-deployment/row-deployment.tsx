import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type Row } from '@tanstack/react-table'
import clsx from 'clsx'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { LogsType } from '@qovery/shared/enums'
import { Ansi, Icon, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { UpdateTimeContext } from '../../update-time-context/update-time-context'

const { Table } = TablePrimitives

export interface RowDeploymentProps extends Row<EnvironmentLogs> {}

export function RowDeployment({ index, original, id }: RowDeploymentProps) {
  const { utc } = useContext(UpdateTimeContext)
  const [, copyToClipboard] = useCopyToClipboard()
  const { hash } = useLocation()

  const [isHighlighted, setIsHighlighted] = useState(false)
  const [copyLinkIcon, setCopyLinkIcon] = useState<IconName>('link')

  const step = original.details?.stage?.step
  const type = original.type

  const success = step === 'Deployed'
  const error = type === LogsType.ERROR || step === 'DeployedError'

  const rowId = `${index + 1}-${original.timestamp}`
  const encodedRowId = encodeURIComponent(rowId)

  useEffect(() => {
    const cleanHash = decodeURIComponent(hash.replace('#', ''))
    setIsHighlighted(cleanHash === rowId)
  }, [hash, rowId])

  const currentUrl = window.location.href.split('#')[0]

  return (
    <Table.Row
      id={encodedRowId}
      className={twMerge(
        clsx('group mb-0.5 flex min-h-6 select-none bg-neutral-600 text-xs', {
          'hover:bg-neutral-550': !isHighlighted,
          'bg-neutral-550': isHighlighted,
        })
      )}
    >
      <Table.Cell className="h-6 w-10 py-1 pl-2 pr-1 text-left font-code font-bold text-neutral-300 group-hover:bg-neutral-550 group-hover:delay-1000">
        <Tooltip content="Copy row URL">
          <span>
            <span className={`group-hover:hidden ${isHighlighted ? 'hidden' : ''}`}>{index + 1}</span>
            <button
              className={clsx('block text-sm text-neutral-50', {
                'hidden group-hover:block': !isHighlighted,
                'text-purple-400': isHighlighted,
                'hover:text-purple-400': !isHighlighted,
              })}
              onClick={() => {
                setCopyLinkIcon('check')
                copyToClipboard(`${currentUrl}#${encodedRowId}`)
                setTimeout(() => setCopyLinkIcon('link'), 1000)
              }}
            >
              <Icon iconName={copyLinkIcon} iconStyle="regular" />
            </button>
          </span>
        </Tooltip>
      </Table.Cell>
      <Table.Cell className="h-fit shrink-0 py-1 pl-2 pr-3 font-code font-bold text-neutral-300">
        <span title={dateUTCString(original.timestamp)}>
          {dateFullFormat(original.timestamp, utc ? 'UTC' : undefined, 'dd MMM, HH:mm:ss.SS')}
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

export default RowDeployment
