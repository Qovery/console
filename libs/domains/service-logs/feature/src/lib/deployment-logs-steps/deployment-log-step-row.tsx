import clsx from 'clsx'
import { useLayoutEffect, useRef, useState } from 'react'
import { LogsType } from '@qovery/shared/enums'
import { Ansi, Badge, Button, Icon, StatusChip, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import {
  LOG_COPY_EXCLUDE_DATA_ATTRIBUTE,
  LOG_MESSAGE_DATA_ATTRIBUTE,
  copySelectedLogMessages,
  pluralize,
} from '@qovery/shared/util-js'
import { type EnvironmentLogIds } from '../hooks/use-deployment-logs/use-deployment-logs'
import { splitAnsiTextOnMatches } from '../utils/ansi-text-matches'
import {
  type DeploymentLogStep,
  type DeploymentLogStepStatus,
  formatDeploymentLogDuration,
  getDeploymentLogLineMessage,
} from '../utils/deployment-log-steps'

// Rendering every line of a long build slows the page down: older lines are shown on demand
const MAX_VISIBLE_LINES = 1000

export function DeploymentLogStatusIcon({ status }: { status?: DeploymentLogStepStatus }) {
  if (!status) return null

  if (status === 'PENDING') {
    return (
      <Tooltip content="Not started">
        <span role="img" aria-label="Not started" className="flex h-3.5 w-3.5 items-center justify-center">
          <Icon iconName="circle-dashed" iconStyle="regular" className="text-sm text-neutral-disabled" />
        </span>
      </Tooltip>
    )
  }

  return <StatusChip status={status} />
}

// Highlights the matches the way `HighlightText` does, keeping the colors of the rest of the message
function HighlightedLogMessage({ message, searchQuery }: { message: string; searchQuery: string }) {
  return splitAnsiTextOnMatches(message, searchQuery).map((part, index) =>
    part.isMatch ? (
      <mark key={index} className="rounded-sm bg-surface-warning-highlight text-neutral">
        {part.text}
      </mark>
    ) : (
      <Ansi key={index}>{part.text}</Ansi>
    )
  )
}

function DeploymentLogLine({ line, searchQuery }: { line: EnvironmentLogIds; searchQuery: string }) {
  const message = getDeploymentLogLineMessage(line)
  const step = line.details.stage?.step
  const isErrorLine = line.type === LogsType.ERROR
  const isError = isErrorLine || step === 'DeployedError'
  const isSuccess = step === 'Deployed'

  return (
    <div className="flex items-start">
      <span
        className="w-20 shrink-0 select-none text-neutral-subtle"
        title={dateUTCString(line.timestamp)}
        {...{ [LOG_COPY_EXCLUDE_DATA_ATTRIBUTE]: 'true' }}
      >
        {dateFullFormat(line.timestamp, 'UTC', 'HH:mm:ss')}
      </span>
      <span
        className={clsx('min-w-0 flex-1 whitespace-pre-wrap break-all', {
          'text-negative': isError,
          'text-positive': isSuccess,
          'text-neutral': !isError && !isSuccess,
        })}
        {...{ [LOG_MESSAGE_DATA_ATTRIBUTE]: 'true' }}
      >
        {searchQuery.trim() ? (
          <HighlightedLogMessage message={message} searchQuery={searchQuery} />
        ) : (
          <Ansi>{message}</Ansi>
        )}
      </span>
    </div>
  )
}

function DeploymentLogLines({
  lines,
  isStreaming,
  searchQuery,
}: {
  lines: EnvironmentLogIds[]
  isStreaming: boolean
  searchQuery: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isScrolledToBottomRef = useRef(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAllLines, setShowAllLines] = useState(false)

  const hiddenLinesCount = showAllLines ? 0 : Math.max(0, lines.length - MAX_VISIBLE_LINES)
  const visibleLines = hiddenLinesCount > 0 ? lines.slice(hiddenLinesCount) : lines

  // Follows new lines like a terminal, unless the user scrolled up to read older ones
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (element && isScrolledToBottomRef.current) {
      element.scrollTop = element.scrollHeight
    }
  }, [visibleLines.length])

  return (
    <div className="relative border-t border-neutral bg-surface-neutral-subtle">
      {isScrolled && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-5 bg-gradient-to-b from-surface-neutral-subtle to-transparent" />
      )}
      <div
        ref={scrollRef}
        className="flex max-h-[400px] flex-col gap-1 overflow-y-auto px-4 py-2 font-code text-xs leading-5"
        onCopy={copySelectedLogMessages}
        onScroll={(event) => {
          const element = event.currentTarget
          isScrolledToBottomRef.current = element.scrollTop + element.clientHeight >= element.scrollHeight - 4
          setIsScrolled(element.scrollTop > 0)
        }}
      >
        {hiddenLinesCount > 0 && (
          <Button
            variant="outline"
            color="neutral"
            size="xs"
            className="mb-1 self-start font-sans"
            onClick={() => setShowAllLines(true)}
          >
            Show {hiddenLinesCount.toLocaleString('en-US')} previous {pluralize(hiddenLinesCount, 'line')}
          </Button>
        )}
        {visibleLines.map((line) => (
          <DeploymentLogLine key={line.id} line={line} searchQuery={searchQuery} />
        ))}
        {isStreaming && <p className="font-sans text-sm font-medium text-neutral-subtle">Streaming deployment logs…</p>}
      </div>
    </div>
  )
}

export interface DeploymentLogStepRowProps {
  step: DeploymentLogStep<EnvironmentLogIds>
  label: string
  isOpen: boolean
  searchQuery: string
  isSlowest?: boolean
  onToggle: () => void
}

export function DeploymentLogStepRow({
  step,
  label,
  isOpen,
  searchQuery,
  isSlowest = false,
  onToggle,
}: DeploymentLogStepRowProps) {
  const linesCount = step.lines.length
  const hasLines = linesCount > 0
  const isNotStarted = step.status === 'PENDING' || step.status === 'SKIP'

  const isSearching = searchQuery.trim() !== ''

  const matchesCountLabel = isSearching
    ? `${linesCount.toLocaleString('en-US')} ${pluralize(linesCount, 'match', 'matches')}`
    : null

  return (
    <div className="border-b border-neutral last:border-b-0">
      <button
        type="button"
        className="flex h-12 w-full items-center justify-between gap-4 px-4 text-left text-sm enabled:hover:bg-surface-neutral-subtle disabled:cursor-default"
        onClick={onToggle}
        disabled={!hasLines}
        aria-expanded={hasLines ? isOpen : undefined}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Icon
            iconName={isOpen && hasLines ? 'angle-down' : 'angle-right'}
            iconStyle="regular"
            className={clsx('w-3.5 text-xs', hasLines ? 'text-neutral' : 'text-neutral-disabled')}
          />
          <span className={clsx('truncate', isNotStarted ? 'text-neutral-disabled' : 'text-neutral')}>{label}</span>
          <DeploymentLogStatusIcon status={step.status} />
          {matchesCountLabel && <span className="shrink-0 text-neutral-subtle">{matchesCountLabel}</span>}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {isSlowest && (
            <Badge size="sm" color="yellow" variant="surface" className="rounded-md font-medium">
              Slowest
            </Badge>
          )}
          {step.durationSec !== undefined && !isNotStarted && (
            <span className="text-neutral-subtle">{formatDeploymentLogDuration(step.durationSec)}</span>
          )}
        </span>
      </button>
      {isOpen && hasLines && (
        <DeploymentLogLines lines={step.lines} isStreaming={step.status === 'ONGOING'} searchQuery={searchQuery} />
      )}
    </div>
  )
}

export default DeploymentLogStepRow
