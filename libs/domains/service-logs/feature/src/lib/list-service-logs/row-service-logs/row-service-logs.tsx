import { type Row } from '@tanstack/react-table'
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
import { queryParamsServiceLogs, useServiceLogsContext } from '../service-logs-context/service-logs-context'
import './style.scss'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const { Table } = TablePrimitives

export interface RowServiceLogsProps extends Row<NormalizedServiceLog> {
  hasMultipleContainers: boolean
}

export function RowServiceLogs({ hasMultipleContainers, getVisibleCells, original }: RowServiceLogsProps) {
  const [, setQueryParams] = useQueryParams(queryParamsServiceLogs)
  const [isExpanded, setIsExpanded] = useState(false)

  const { updateTimeContextValue } = useServiceLogsContext()
  const { utc } = updateTimeContextValue

  const getColorByPod = usePodColor()
  const timestamp = Number(original.timestamp)

  return (
    <>
      <Table.Row
        onClick={() => setIsExpanded(!isExpanded)}
        className="sl-row relative mt-0.5 cursor-pointer text-xs before:absolute before:left-0.5 before:top-1 before:block before:h-[calc(100%-4px)] before:w-1 before:bg-neutral-500 before:content-['']"
      >
        <Table.Cell className="flex h-min min-h-9 select-none items-center gap-2 whitespace-nowrap pr-1.5">
          <span className="flex h-3 w-3 items-center justify-center">
            <Icon className="text-neutral-300" iconName={isExpanded ? 'chevron-down' : 'chevron-right'} />
          </span>
          <Tooltip content={original.instance}>
            <Button
              type="button"
              variant="surface"
              color="neutral"
              size="xs"
              className="gap-1.5 font-code"
              onClick={(e) => {
                e.stopPropagation()
                setQueryParams({ instance: original.instance })
              }}
            >
              <span
                className="block h-1.5 w-1.5 min-w-1.5 rounded-sm"
                style={{ backgroundColor: getColorByPod(original.instance ?? '') }}
              />
              {original.instance?.substring(original.instance?.length - 5)}
            </Button>
          </Tooltip>
        </Table.Cell>
        <Table.Cell className="h-min min-h-9 select-none whitespace-nowrap px-1.5 align-baseline font-code font-bold text-neutral-300">
          <span title={dateUTCString(timestamp)} className="inline-block whitespace-nowrap">
            {dateFullFormat(timestamp, utc ? 'UTC' : timeZone, 'dd MMM, HH:mm:ss.SS')}
          </span>
        </Table.Cell>
        {hasMultipleContainers && (
          <Table.Cell className="flex h-min min-h-9 select-none items-center gap-2 whitespace-nowrap px-1.5">
            <Tooltip content={original.container}>
              <Button
                type="button"
                variant="surface"
                color="neutral"
                size="xs"
                className="gap-1.5 whitespace-nowrap font-code"
                onClick={(e) => {
                  e.stopPropagation()
                  setQueryParams({ container: original.container })
                }}
              >
                {original.container}
              </Button>
            </Tooltip>
          </Table.Cell>
        )}
        <Table.Cell className="h-min min-h-9 w-full pb-1 pl-1.5 pr-3 pt-2.5 align-top font-code font-bold">
          <Ansi className="relative w-full select-text whitespace-pre-wrap break-all pr-6 text-neutral-50">
            {original.message}
          </Ansi>
        </Table.Cell>
      </Table.Row>
      {isExpanded && (
        <Table.Row className="sl-expanded relative text-xs before:absolute before:left-0.5 before:block before:h-full before:w-1 before:bg-neutral-500 before:content-['']">
          <Table.Cell className="py-4 pl-1" colSpan={getVisibleCells().length}>
            <div className="w-full rounded border border-neutral-500 bg-neutral-550 px-4 py-2">
              <Dl className="grid-cols-[20px_100px_minmax(0,_1fr)] gap-x-2 gap-y-0 text-xs">
                <Dt className="col-span-2 select-none font-code">Instance</Dt>
                <Dd className="flex gap-1 text-sm leading-3 dark:font-medium">{original.instance}</Dd>
                <Dt className="col-span-2 mt-2 select-none font-code">Container</Dt>
                <Dd className="mt-2 flex gap-1 text-sm leading-3 dark:font-medium">{original.container}</Dd>
                {original.version && (
                  <>
                    <Dt className="col-span-2 mt-2 select-none font-code">Version</Dt>
                    <Dd className="mt-2 flex select-none gap-1 text-sm leading-3 dark:font-medium">
                      <Tooltip content={original.version}>
                        <Button
                          type="button"
                          variant="surface"
                          color="neutral"
                          size="xs"
                          className="gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation()
                            setQueryParams({ version: original.version })
                          }}
                        >
                          <Icon iconName="code-commit" iconStyle="regular" />
                          {original.version.substring(0, 7)}
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
