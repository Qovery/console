import { type Row } from '@tanstack/react-table'
import clsx from 'clsx'
import { type ServiceLogResponseDto } from 'qovery-ws-typescript-axios'
import { useContext } from 'react'
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
import { twMerge } from '@qovery/shared/util-js'
import { type LogType } from '../../hooks/use-service-logs/use-service-logs'
import { UpdateTimeContext } from '../../update-time-context/update-time-context'
import { usePodColor } from '../use-pod-color'
import './style.scss'

const { Table } = TablePrimitives

export interface RowServiceLogsProps extends Row<ServiceLogResponseDto & { type: LogType; id: number }> {
  hasMultipleContainers: boolean
  toggleColumnFilter: (id: string, value: string) => void
  isFilterActive: (id: string, value: string) => boolean
}

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export function RowServiceLogs({
  hasMultipleContainers,
  toggleColumnFilter,
  isFilterActive,
  getVisibleCells,
  toggleExpanded,
  getIsExpanded,
  original,
}: RowServiceLogsProps) {
  const { utc } = useContext(UpdateTimeContext)
  const getColorByPod = usePodColor()

  const isExpanded = getIsExpanded()

  return (
    <>
      {/*
        `getToggleExpandedHandler` is not used due to issues with its functionality in subcomponents. 
        No correct solution found, just passing in props from parent and it works.
      */}
      <Table.Row
        onClick={() => toggleExpanded(!isExpanded)}
        className="sl-row relative mt-0.5 cursor-pointer text-xs before:absolute before:left-0.5 before:top-1 before:block before:h-[calc(100%-4px)] before:w-1 before:bg-neutral-500 before:content-['']"
      >
        <Table.Cell className="flex h-min min-h-9 select-none items-center gap-2 whitespace-nowrap pr-1.5">
          <span className="flex h-3 w-3 items-center justify-center">
            <Icon className="text-neutral-300" iconName={isExpanded ? 'chevron-down' : 'chevron-right'} />
          </span>
          <Tooltip content={original.pod_name}>
            <Button
              type="button"
              variant="surface"
              color="neutral"
              size="xs"
              className={twMerge(
                clsx('gap-1.5 font-code', {
                  'outline outline-1 outline-brand-400 hover:!border-brand-400 dark:border-brand-400': isFilterActive(
                    'pod_name',
                    original.pod_name
                  ),
                })
              )}
              onClick={(e) => {
                e.stopPropagation()
                toggleColumnFilter('pod_name', original.pod_name)
              }}
            >
              <span
                className="block h-1.5 w-1.5 min-w-1.5 rounded-sm"
                style={{ backgroundColor: getColorByPod(original.pod_name) }}
              />
              {original.pod_name.substring(original.pod_name.length - 5)}
            </Button>
          </Tooltip>
        </Table.Cell>
        <Table.Cell className="h-min min-h-9 select-none whitespace-nowrap px-1.5 align-baseline font-code font-bold text-neutral-300">
          <span title={dateUTCString(original.created_at)} className="inline-block whitespace-nowrap">
            {dateFullFormat(original.created_at, utc ? 'UTC' : timeZone, 'dd MMM, HH:mm:ss.SS')}
          </span>
        </Table.Cell>
        {hasMultipleContainers && (
          <Table.Cell className="flex h-min min-h-9 select-none items-center gap-2 whitespace-nowrap px-1.5">
            <Tooltip content={original.container_name}>
              <Button
                type="button"
                variant="surface"
                color="neutral"
                size="xs"
                className={twMerge(
                  clsx('gap-1.5 whitespace-nowrap font-code', {
                    'outline outline-1 outline-brand-400 hover:!border-brand-400 dark:border-brand-400': isFilterActive(
                      'container_name',
                      original.container_name
                    ),
                  })
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleColumnFilter('container_name', original.container_name)
                }}
              >
                {original.container_name}
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
                <Dt className="col-span-2 select-none font-code">Podname</Dt>
                <Dd className="flex gap-1 text-sm leading-3 dark:font-medium">{original.pod_name}</Dd>
                <Dt className="col-span-2 mt-2 select-none font-code">Container</Dt>
                <Dd className="mt-2 flex gap-1 text-sm leading-3 dark:font-medium">{original.container_name}</Dd>
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
                          className={twMerge(
                            clsx('gap-1.5', {
                              'outline outline-1 outline-brand-400 hover:!border-brand-400 dark:border-brand-400':
                                isFilterActive('version', original.version),
                            })
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleColumnFilter('version', original.version)
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
