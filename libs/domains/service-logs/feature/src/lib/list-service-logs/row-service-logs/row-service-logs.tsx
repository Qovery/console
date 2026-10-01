import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import clsx from 'clsx'
import { type MouseEvent, type ReactNode, useCallback, useMemo, useState } from 'react'
import { type NormalizedServiceLog } from '@qovery/domains/service-logs/data-access'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type ServiceLogsParams } from '@qovery/shared/router'
import {
  Ansi,
  Badge,
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
import {
  LOG_COPY_EXCLUDE_DATA_ATTRIBUTE,
  LOG_MESSAGE_DATA_ATTRIBUTE,
  copySelectedLogMessages,
  twMerge,
} from '@qovery/shared/util-js'
import { mergeServiceLogsParams } from '../../search-service-logs/search-service-logs-utils'
import { useServiceLogsContext } from '../service-logs-context/service-logs-context'
import { type HighlightRange, findHighlightRanges, formatObjectLogMessage } from './format-object-log-message'
import './style.scss'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const { Table } = TablePrimitives

const URL_REGEX = /https?:\/\/[^\s"'<>]+/gi
const TRAILING_URL_PUNCTUATION_REGEX = /[),.;!?]+$/

function renderHighlightedText(
  text: string,
  textStart: number,
  highlightRanges: HighlightRange[],
  keyRanges: HighlightRange[],
  key: string,
  renderAnsi = true
): ReactNode {
  const textEnd = textStart + text.length
  const visibleHighlightRanges = highlightRanges.filter(({ start, end }) => start < textEnd && end > textStart)
  const visibleKeyRanges = keyRanges.filter(({ start, end }) => start < textEnd && end > textStart)
  const ranges = [...visibleHighlightRanges, ...visibleKeyRanges]

  if (ranges.length === 0) {
    if (!renderAnsi) return text

    return (
      <Ansi key={key} linkify={false}>
        {text}
      </Ansi>
    )
  }

  const boundaries = new Set([0, text.length])
  for (const { start, end } of ranges) {
    boundaries.add(Math.max(start, textStart) - textStart)
    boundaries.add(Math.min(end, textEnd) - textStart)
  }

  const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b)
  let highlightRangeIndex = 0
  let keyRangeIndex = 0
  const parts = sortedBoundaries.slice(0, -1).map((start, index) => {
    const end = sortedBoundaries[index + 1] ?? start
    const globalStart = textStart + start
    const globalEnd = textStart + end

    while ((visibleHighlightRanges[highlightRangeIndex]?.end ?? Infinity) <= globalStart) {
      highlightRangeIndex++
    }
    while ((visibleKeyRanges[keyRangeIndex]?.end ?? Infinity) <= globalStart) {
      keyRangeIndex++
    }

    const highlightRange = visibleHighlightRanges[highlightRangeIndex]
    const keyRange = visibleKeyRanges[keyRangeIndex]

    return {
      text: text.slice(start, end),
      highlighted: Boolean(highlightRange && highlightRange.start < globalEnd),
      isKey: Boolean(keyRange && keyRange.start < globalEnd),
    }
  })

  return parts.map((part, index) => {
    if (part.highlighted) {
      return (
        <mark
          key={`${key}-${index}`}
          style={{
            color: '#000',
            background: 'rgb(255, 153, 0)',
          }}
        >
          {part.text}
        </mark>
      )
    }

    if (part.isKey) {
      return (
        <span key={`${key}-${index}`} className="text-accent1">
          {part.text}
        </span>
      )
    }

    if (!renderAnsi) return part.text

    return (
      <Ansi key={`${key}-${index}`} linkify={false}>
        {part.text}
      </Ansi>
    )
  })
}

export interface RowServiceLogsProps {
  log: NormalizedServiceLog
  hasMultipleContainers: boolean
  highlightedText?: string | null
  service?: AnyService
}

export function RowServiceLogs({ log, hasMultipleContainers, highlightedText, service }: RowServiceLogsProps) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryParams = useSearch({ strict: false })

  const [isExpanded, setIsExpanded] = useState(false)

  const serviceType = service?.serviceType

  const isNginx = log.app === 'ingress-nginx'
  const isEnvoy = log.app === 'envoy'

  const { updateTimeContextValue } = useServiceLogsContext()
  const { utc } = updateTimeContextValue

  const getColorByPod = usePodColor()
  const timestamp = Number(log.timestamp)

  const setQueryParams = useCallback(
    (searchParams: ServiceLogsParams) => {
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/service-logs',
        params: {
          organizationId,
          projectId,
          environmentId,
          serviceId,
        },
        search: mergeServiceLogsParams(queryParams, searchParams),
      })
    },
    [navigate, organizationId, projectId, environmentId, serviceId, queryParams]
  )

  const toggleExpanded = (e?: MouseEvent<HTMLElement>) => {
    // Keep URLs inside log messages clickable: clicking a link must open it, not toggle the row
    if (e?.target instanceof Element && e.target.closest('a')) return
    if (window.getSelection()?.type === 'Range') return
    if (!isNginx && !isEnvoy) setIsExpanded(!isExpanded)
  }

  const renderHighlightedMessage = (message: string, highlightRanges: HighlightRange[]) => {
    const keyRanges = formattedLogMessage.keyRanges ?? []
    const content: ReactNode[] = []
    let currentIndex = 0

    for (const match of message.matchAll(URL_REGEX)) {
      const matchedUrl = match[0]
      const url = matchedUrl.replace(TRAILING_URL_PUNCTUATION_REGEX, '')
      const startIndex = match.index ?? 0

      if (startIndex > currentIndex) {
        content.push(
          renderHighlightedText(
            message.slice(currentIndex, startIndex),
            currentIndex,
            highlightRanges,
            keyRanges,
            `text-${currentIndex}`
          )
        )
      }

      content.push(
        <a
          key={`url-${startIndex}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={url}
          className="underline"
        >
          {renderHighlightedText(url, startIndex, highlightRanges, keyRanges, `url-text-${startIndex}`, false)}
        </a>
      )

      const trailingPunctuation = matchedUrl.slice(url.length)
      if (trailingPunctuation) {
        content.push(
          renderHighlightedText(
            trailingPunctuation,
            startIndex + url.length,
            highlightRanges,
            keyRanges,
            `trailing-punctuation-${startIndex + url.length}`
          )
        )
      }

      currentIndex = startIndex + matchedUrl.length
    }

    if (currentIndex < message.length) {
      content.push(
        renderHighlightedText(
          message.slice(currentIndex),
          currentIndex,
          highlightRanges,
          keyRanges,
          `text-${currentIndex}`
        )
      )
    }

    return (
      <span
        className="code-ansi relative w-full whitespace-pre-wrap break-all pr-6 text-neutral"
        {...{ [LOG_MESSAGE_DATA_ATTRIBUTE]: 'true' }}
      >
        {content}
      </span>
    )
  }

  const levelLowercase = log.level?.toLowerCase()
  const isErrorOrCritical = levelLowercase === 'error' || levelLowercase === 'critical'
  const formattedLogMessage = useMemo(() => formatObjectLogMessage(log.message), [log.message])
  const highlightRanges = useMemo(
    () => findHighlightRanges(log.message, formattedLogMessage, highlightedText),
    [formattedLogMessage, highlightedText, log.message]
  )

  return (
    <>
      <Table.Row
        onClick={toggleExpanded}
        onCopy={copySelectedLogMessages}
        className={twMerge(
          clsx('sl-row sl-row-appear group relative mt-0.5 cursor-pointer text-xs hover:bg-surface-neutral-subtle', {
            'bg-surface-negative-component': isErrorOrCritical,
          })
        )}
      >
        <Table.Cell className="flex h-min min-h-7 select-none items-center gap-2 whitespace-nowrap pr-1.5">
          <Tooltip content={levelLowercase} disabled={!log.level || levelLowercase === 'unknown'}>
            <span
              className={twMerge(
                clsx('absolute left-0.5 top-0 block h-full w-1 bg-surface-neutral-componentHover', {
                  'bg-surface-info-solid': levelLowercase === 'info',
                  'bg-surface-warning-solid': levelLowercase === 'warning',
                  'bg-surface-negative-solid hover:bg-surface-negative-subtle group-hover:bg-surface-negative-subtle':
                    isErrorOrCritical,
                  'bg-surface-negative-subtle': isExpanded && isErrorOrCritical,
                })
              )}
            />
          </Tooltip>
          {!isNginx && !isEnvoy && (
            <span className="flex h-3 w-3 items-center justify-center">
              <Icon className="text-neutral-subtle" iconName={isExpanded ? 'chevron-down' : 'chevron-right'} />
            </span>
          )}
          {isNginx ? (
            <Badge variant="outline" color="neutral" className="ml-5 h-5 gap-1.5 rounded px-1.5 font-code">
              NGINX
            </Badge>
          ) : isEnvoy ? (
            <Badge variant="outline" color="neutral" className="ml-5 h-5 gap-1.5 rounded px-1.5 font-code">
              ENVOY
            </Badge>
          ) : (
            <Tooltip content={log.instance} delayDuration={300}>
              <Button
                type="button"
                variant="outline"
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
          )}
        </Table.Cell>
        <Table.Cell className="h-min min-h-7 whitespace-nowrap px-1.5 align-baseline font-code font-bold text-neutral-subtle selection:bg-transparent selection:text-neutral-subtle">
          <span
            title={dateUTCString(timestamp)}
            className="inline-block whitespace-nowrap"
            {...{ [LOG_COPY_EXCLUDE_DATA_ATTRIBUTE]: 'true' }}
          >
            {dateFullFormat(timestamp, utc ? 'UTC' : timeZone, 'dd MMM, HH:mm:ss.SS')}
          </span>
        </Table.Cell>
        {hasMultipleContainers && (isNginx || isEnvoy) && <Table.Cell className="flex h-0 w-0 p-0"></Table.Cell>}
        {hasMultipleContainers && !isNginx && !isEnvoy && (
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
          {renderHighlightedMessage(formattedLogMessage.message, highlightRanges)}
        </Table.Cell>
      </Table.Row>
      {isExpanded && (
        <Table.Row
          className={twMerge(
            clsx(
              'sl-expanded relative -top-0.5 h-[calc(100%+2px)] text-xs before:absolute before:left-0.5 before:block before:h-full before:w-1 before:content-[""]',
              {
                'bg-surface-negative-subtle': isErrorOrCritical,
              }
            )
          )}
        >
          <Table.Cell className="py-4 pl-1" colSpan={hasMultipleContainers ? 5 : 4}>
            <div className="w-full rounded border border-neutral bg-transparent px-4 py-2">
              <Dl className="grid-cols-[20px_100px_minmax(0,_1fr)] gap-x-2 gap-y-0 text-xs">
                {log.level && levelLowercase !== 'warning' && (
                  <>
                    <Dt className="col-span-2 flex select-none items-center font-code text-xs">Level</Dt>
                    <Dd className="flex gap-1 text-xs leading-3">
                      <Button
                        type="button"
                        variant="surface"
                        color="neutral"
                        size="xs"
                        className="gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation()
                          setQueryParams({ level: levelLowercase })
                        }}
                      >
                        {levelLowercase}
                      </Button>
                    </Dd>
                  </>
                )}
                <Dt
                  className={clsx('col-span-2 flex select-none items-center font-code text-xs', {
                    'mt-2': log.level,
                  })}
                >
                  Instance
                </Dt>
                <Dd
                  className={clsx('flex gap-1 text-xs leading-3', {
                    'mt-2': log.level,
                  })}
                >
                  <Button
                    type="button"
                    variant="surface"
                    color="neutral"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setQueryParams({ instance: log.instance })
                    }}
                  >
                    {log.instance}
                  </Button>
                </Dd>
                <Dt className="col-span-2 mt-2 flex select-none items-center font-code text-xs">Container</Dt>
                <Dd className="mt-2 flex gap-1 text-xs leading-3">
                  {hasMultipleContainers || serviceType === 'HELM' ? (
                    <Button
                      type="button"
                      variant="surface"
                      color="neutral"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        setQueryParams({ container: log.container })
                      }}
                    >
                      {log.container}
                    </Button>
                  ) : (
                    <span className="flex h-5 items-center px-2">{log.container}</span>
                  )}
                </Dd>
                {log.version && (
                  <>
                    <Dt className="col-span-2 mt-2 flex select-none items-center font-code text-xs">Version</Dt>
                    <Dd className="mt-2 flex select-none gap-1 text-xs leading-3">
                      <span className="flex h-5 items-center px-2">{log.version}</span>
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
