import { type ClusterLogs } from 'qovery-typescript-axios'
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@qovery/shared/ui'
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
  }, [firstLogTimestamp])

  useEffect(() => {
    const section = refScrollSection.current
    if (!section) return

    const hasNewLogs = logs.length > previousLogCountRef.current
    previousLogCountRef.current = logs.length

    if (!hasNewLogs || !shouldAutoScrollRef.current) return

    section.scroll(0, section.scrollHeight + SCROLL_BOTTOM_PADDING)
  }, [logs.length, refScrollSection])

  return (
    <div
      ref={refScrollSection}
      data-testid="cluster-logs-scroll-section"
      className="w-full flex-1 overflow-y-auto pb-10"
      onScroll={(event) => {
        shouldAutoScrollRef.current = isNearBottom(event.currentTarget)
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
  )
}

export default ClusterLogsList
