import clsx from 'clsx'
import { useState } from 'react'
import { useQueryParams } from 'use-query-params'
import { type NormalizedServiceLog } from '@qovery/domains/service-logs/data-access'
import {
  Ansi,
  Button,
  DescriptionDetails as Dd,
  DescriptionListRoot as Dl,
  DescriptionTerm as Dt,
  Icon,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { usePodColor } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { queryParamsServiceLogs, useServiceLogsContext } from '../service-logs-context/service-logs-context'
import './style.scss'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const { Table } = TablePrimitives

export interface RowServiceLogsProps {
  log: NormalizedServiceLog
  hasMultipleContainers: boolean
  highlightedText?: string | null
}

export function RowServiceLogs({ log, hasMultipleContainers, highlightedText }: RowServiceLogsProps) {
  const [, setQueryParams] = useQueryParams(queryParamsServiceLogs)
  const [isExpanded, setIsExpanded] = useState(false)

  const { updateTimeContextValue } = useServiceLogsContext()
  const { utc } = updateTimeContextValue

  const getColorByPod = usePodColor()
  const timestamp = Number(log.timestamp)

  const renderHighlightedMessage = (message: string, searchTerm: string | null | undefined) => {
    if (!searchTerm || !message.includes(searchTerm)) {
      return (
        <Ansi className="relative w-full select-text whitespace-pre-wrap break-all pr-6 text-neutral-50">
          {message}
        </Ansi>
      )
    }

    const parts = message.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))

    return (
      <span className="relative w-full select-text whitespace-pre-wrap break-all pr-6 text-neutral-50">
        {parts.map((part, index) => {
          if (part.toLowerCase() === searchTerm.toLowerCase()) {
            return (
              <mark
                key={index}
                style={{
                  color: '#000',
                  background: 'rgb(255, 153, 0)',
                }}
              >
                {part}
              </mark>
            )
          }
          return <Ansi key={index}>{part}</Ansi>
        })}
      </span>
    )
  }

  return (
    <>
      <Table.Row
        onClick={() => setIsExpanded(!isExpanded)}
        className={twMerge(
          clsx(
            'sl-row sl-row-appear relative mt-0.5 cursor-pointer text-xs before:absolute before:left-0.5 before:block before:h-full before:w-1 before:bg-neutral-500 before:content-[""]',
            {
              'before:bg-sky-500': log.level === 'INFO',
              'before:bg-yellow-500': log.level === 'WARNING',
              'bg-red-500/10 before:bg-red-500 hover:before:bg-red-400': log.level === 'ERROR',
            }
          )
        )}
      >
        <Table.Cell className="flex h-min min-h-7 select-none items-center gap-2 whitespace-nowrap pr-1.5">
          <span className="flex h-3 w-3 items-center justify-center">
            <Icon className="text-neutral-300" iconName={isExpanded ? 'chevron-down' : 'chevron-right'} />
          </span>
          <Tooltip content={log.instance} delayDuration={300}>
            <Button
              type="button"
              variant="surface"
              color="neutral"
              size="xs"
              className="h-5 gap-1.5 px-1.5 font-code"
              onClick={(e) => {
                e.stopPropagation()
                setQueryParams({ instance: log.instance })
              }}
            >
              <span
                className="block h-1.5 w-1.5 min-w-1.5 rounded-sm"
                style={{ backgroundColor: getColorByPod(log.instance ?? '') }}
              />
              {log.instance?.substring(log.instance?.length - 5)}
            </Button>
          </Tooltip>
        </Table.Cell>
        <Table.Cell className="h-min min-h-7 select-none whitespace-nowrap px-1.5 align-baseline font-code font-bold text-neutral-300">
          <span title={dateUTCString(timestamp)} className="inline-block whitespace-nowrap">
            {dateFullFormat(timestamp, utc ? 'UTC' : timeZone, 'dd MMM, HH:mm:ss.SS')}
          </span>
        </Table.Cell>
        {hasMultipleContainers && (
          <Table.Cell className="flex h-min min-h-7 select-none items-center gap-2 whitespace-nowrap px-1.5">
            <Tooltip content={log.container} delayDuration={300}>
              <Button
                type="button"
                variant="surface"
                color="neutral"
                size="xs"
                className="gap-1.5 whitespace-nowrap font-code"
                onClick={(e) => {
                  e.stopPropagation()
                  setQueryParams({ container: log.container })
                }}
              >
                {log.container}
              </Button>
            </Tooltip>
          </Table.Cell>
        )}
        <Table.Cell className="h-min min-h-7 w-full pb-1 pl-1.5 pr-4 pt-[0.4rem] align-top font-code font-bold">
          {renderHighlightedMessage(log.message, highlightedText)}
        </Table.Cell>
      </Table.Row>
      {isExpanded && (
        <Table.Row
          className={twMerge(
            clsx(
              'sl-expanded relative -top-0.5 h-[calc(100%+2px)] text-xs before:absolute before:left-0.5 before:block before:h-full before:w-1 before:content-[""]',
              {
                'bg-red-500/10': log.level === 'ERROR',
              }
            )
          )}
        >
          <Table.Cell className="py-4 pl-1" colSpan={hasMultipleContainers ? 5 : 4}>
            <div className="w-full rounded border border-neutral-400 bg-transparent px-4 py-2">
              <Dl className="grid-cols-[20px_100px_minmax(0,_1fr)] gap-x-2 gap-y-0 text-xs">
                <Dt className="col-span-2 select-none font-code">Instance</Dt>
                <Dd className="flex gap-1 text-sm leading-3 dark:font-medium">{log.instance}</Dd>
                <Dt className="col-span-2 mt-2 select-none font-code">Container</Dt>
                <Dd className="mt-2 flex gap-1 text-sm leading-3 dark:font-medium">{log.container}</Dd>
                {log.version && (
                  <>
                    <Dt className="col-span-2 mt-2 select-none font-code">Version</Dt>
                    <Dd className="mt-2 flex select-none gap-1 text-sm leading-3 dark:font-medium">
                      <Tooltip content={log.version} delayDuration={300}>
                        <Button
                          type="button"
                          variant="surface"
                          color="neutral"
                          size="xs"
                          className="gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation()
                            setQueryParams({ version: log.version })
                          }}
                        >
                          <Icon iconName="code-commit" iconStyle="regular" />
                          {log.version.substring(0, 7)}
                        </Button>
                      </Tooltip>
                    </Dd>
                  </>
                )}
              </Dl>
            </div>
          </Table.Cell>
        </Table.Row>
      )}
    </>
  )
}

export default RowServiceLogs
