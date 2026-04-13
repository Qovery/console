import { type ClusterLogs } from 'qovery-typescript-axios'
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { ClusterLogRow } from '../cluster-log-row/cluster-log-row'

const MAX_VISIBLE_CLUSTER_LOGS = 500
const SCROLL_BOTTOM_PADDING = 40
const AUTO_SCROLL_THRESHOLD = 40

export interface ClusterLogsListProps {
  logs: ClusterLogs[]
  firstDate?: Date
  refScrollSection: RefObject<HTMLDivElement>
}

function isNearBottom(section: HTMLDivElement) {
  return section.scrollHeight - section.scrollTop - section.clientHeight <= AUTO_SCROLL_THRESHOLD
}

export function ClusterLogsList({ logs, firstDate, refScrollSection }: ClusterLogsListProps) {
  const [showPreviousLogs, setShowPreviousLogs] = useState(false)
  const [isScrolledUp, setIsScrolledUp] = useState(false)
  const [bufferedLogsCount, setBufferedLogsCount] = useState(0)
  const shouldAutoScrollRef = useRef(true)
  const previousLogCountRef = useRef(0)
  const firstLogTimestamp = logs[0]?.timestamp

  const visibleStartIndex = showPreviousLogs ? 0 : Math.max(logs.length - MAX_VISIBLE_CLUSTER_LOGS, 0)
  const visibleLogs = useMemo(
    () => (visibleStartIndex === 0 ? logs : logs.slice(visibleStartIndex)),
    [logs, visibleStartIndex]
  )

  useEffect(() => {
    setShowPreviousLogs(false)
    shouldAutoScrollRef.current = true
    previousLogCountRef.current = 0
    setBufferedLogsCount(0)
    setIsScrolledUp(false)
  }, [firstLogTimestamp])

  useEffect(() => {
    const section = refScrollSection.current
    if (!section) return

    const newLogsCount = logs.length - previousLogCountRef.current
    previousLogCountRef.current = logs.length

    if (newLogsCount <= 0) return

    if (!shouldAutoScrollRef.current) {
      setBufferedLogsCount((c) => c + newLogsCount)
      return
    }

    section.scroll(0, section.scrollHeight + SCROLL_BOTTOM_PADDING)
  }, [logs.length, refScrollSection])

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      <div
        ref={refScrollSection}
        data-testid="cluster-logs-scroll-section"
        className="min-h-0 w-full flex-1 overflow-y-auto pb-10"
        onScroll={(event) => {
          const atBottom = isNearBottom(event.currentTarget)
          shouldAutoScrollRef.current = atBottom
          setIsScrolledUp(!atBottom)
          if (atBottom) setBufferedLogsCount(0)
        }}
      >
        {!showPreviousLogs && visibleStartIndex > 0 && (
          <button
            type="button"
            className="block w-full bg-surface-neutral py-1.5 text-center text-sm font-medium text-neutral-subtle transition hover:bg-surface-neutral-component"
            onClick={() => setShowPreviousLogs(true)}
          >
            Load previous logs
            <Icon iconName="arrow-up" className="ml-1.5" />
          </button>
        )}

        <div className="flex flex-col">
          {visibleLogs.map((log, index) => (
            <ClusterLogRow
              key={visibleStartIndex + index}
              data={log}
              index={visibleStartIndex + index}
              firstDate={firstDate}
            />
          ))}
        </div>
      </div>
      {isScrolledUp && (
        <Button
          className="absolute bottom-[7px] left-1/2 flex w-72 -translate-x-1/2 items-center justify-center gap-2 text-sm"
          variant="solid"
          radius="full"
          size="md"
          type="button"
          onClick={() => {
            const section = refScrollSection.current
            if (section) section.scroll(0, section.scrollHeight)
          }}
        >
          Jump to latest log
          {bufferedLogsCount > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-semibold tabular-nums">
              {bufferedLogsCount > 999 ? '999+' : bufferedLogsCount}
            </span>
          )}
          <Icon iconName="arrow-down-to-line" />
        </Button>
      )}
    </div>
  )
}

export default ClusterLogsList
