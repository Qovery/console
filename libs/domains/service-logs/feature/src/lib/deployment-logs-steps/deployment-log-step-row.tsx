import clsx from 'clsx'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { LogsType } from '@qovery/shared/enums'
import { AnimatedGradientText, Ansi, Badge, Button, Icon, StatusChip, Tooltip } from '@qovery/shared/ui'
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
  type DeploymentLogLineRange,
  formatDeploymentLogLineHash,
  isDeploymentLogLineSelected,
} from '../utils/deployment-log-line-selection'
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

export interface DeploymentLogLineSelectionProps {
  selectedLineRange?: DeploymentLogLineRange
  onSelectLine: (lineId: number, isExtending: boolean) => void
  // Line the page was opened on, scrolled to once it shows
  lineIdToScrollTo?: number
  onScrolledToLine: () => void
}

function DeploymentLogLine({
  line,
  searchQuery,
  isSelected,
  onSelectLine,
}: {
  line: EnvironmentLogIds
  searchQuery: string
  isSelected: boolean
  onSelectLine: DeploymentLogLineSelectionProps['onSelectLine']
}) {
  const message = getDeploymentLogLineMessage(line)
  const step = line.details.stage?.step
  const isErrorLine = line.type === LogsType.ERROR
  const isError = isErrorLine || step === 'DeployedError'
  const isSuccess = step === 'Deployed'

  return (
    <div
      data-line-id={line.id}
      className={clsx('-mx-4 flex items-start px-4 py-0.5', isSelected && 'bg-surface-brand-component')}
    >
      {/* Links to the line, like GitHub line numbers: shift-click selects the lines in between */}
      <a
        href={`#${formatDeploymentLogLineHash({ start: line.id, end: line.id })}`}
        className={clsx(
          'w-20 shrink-0 select-none hover:text-brand hover:underline',
          isSelected ? 'text-brand' : 'text-neutral-subtle'
        )}
        title={dateUTCString(line.timestamp)}
        onClick={(event) => {
          event.preventDefault()
          onSelectLine(line.id, event.shiftKey)
        }}
        {...{ [LOG_COPY_EXCLUDE_DATA_ATTRIBUTE]: 'true' }}
      >
        {dateFullFormat(line.timestamp, 'UTC', 'HH:mm:ss')}
      </a>
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
  selectedLineRange,
  onSelectLine,
  lineIdToScrollTo,
  onScrolledToLine,
}: {
  lines: EnvironmentLogIds[]
  isStreaming: boolean
  searchQuery: string
} & DeploymentLogLineSelectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isScrolledToBottomRef = useRef(true)
  // Gradients at the top and bottom edges hint that there are more lines to scroll to
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [showAllLines, setShowAllLines] = useState(false)

  const overflowLinesCount = Math.max(0, lines.length - MAX_VISIBLE_LINES)
  // Selected lines are never hidden behind "Show previous lines"
  const hasHiddenSelectedLine = lines
    .slice(0, overflowLinesCount)
    .some((line) => isDeploymentLogLineSelected(selectedLineRange, line.id))
  const hiddenLinesCount = showAllLines || hasHiddenSelectedLine ? 0 : overflowLinesCount
  const visibleLines = hiddenLinesCount > 0 ? lines.slice(hiddenLinesCount) : lines

  const updateScrollEdges = (element: HTMLDivElement) => {
    const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 4
    isScrolledToBottomRef.current = isAtBottom
    setCanScrollUp(element.scrollTop > 0)
    setCanScrollDown(!isAtBottom)
  }

  // Follows new lines like a terminal, unless the user scrolled up to read older ones
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element) return
    if (isScrolledToBottomRef.current) {
      element.scrollTop = element.scrollHeight
    }
    // The browser fires the scroll event of a programmatic scroll a frame later, after the first paint,
    // and none at all when lines arrive while the user reads older ones. Updating the gradients here
    // renders them before that paint, so they don't pop in.
    updateScrollEdges(element)
  }, [visibleLines.length])

  useEffect(() => {
    if (lineIdToScrollTo === undefined) return
    const lineElement = scrollRef.current?.querySelector(`[data-line-id="${lineIdToScrollTo}"]`)
    if (!lineElement) return

    lineElement.scrollIntoView?.({ block: 'center' })
    onScrolledToLine()
  }, [lineIdToScrollTo, visibleLines.length, onScrolledToLine])

  return (
    <div className="relative border-t border-neutral bg-surface-neutral-subtle">
      {canScrollUp && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-5 bg-gradient-to-b from-surface-neutral-subtle to-transparent" />
      )}
      {canScrollDown && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-5 bg-gradient-to-t from-surface-neutral-subtle to-transparent" />
      )}
      <div
        ref={scrollRef}
        className="flex max-h-[400px] flex-col overflow-y-auto px-4 py-1.5 font-code text-xs leading-5"
        onCopy={copySelectedLogMessages}
        onScroll={(event) => updateScrollEdges(event.currentTarget)}
      >
        {hiddenLinesCount > 0 && (
          <Button
            variant="outline"
            color="neutral"
            size="xs"
            className="my-1 self-start font-sans"
            onClick={() => setShowAllLines(true)}
          >
            Show {hiddenLinesCount.toLocaleString('en-US')} previous {pluralize(hiddenLinesCount, 'line')}
          </Button>
        )}
        {visibleLines.map((line) => (
          <DeploymentLogLine
            key={line.id}
            line={line}
            searchQuery={searchQuery}
            isSelected={isDeploymentLogLineSelected(selectedLineRange, line.id)}
            onSelectLine={onSelectLine}
          />
        ))}
        {isStreaming && (
          <AnimatedGradientText className="w-fit py-0.5 font-sans text-sm font-medium">
            Streaming deployment logs…
          </AnimatedGradientText>
        )}
      </div>
    </div>
  )
}

export interface DeploymentLogStepRowProps extends DeploymentLogLineSelectionProps {
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
  ...lineSelectionProps
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
            className={clsx('w-3.5 text-xs', hasLines && !isNotStarted ? 'text-neutral' : 'text-neutral-disabled')}
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
        <DeploymentLogLines
          lines={step.lines}
          isStreaming={step.status === 'ONGOING'}
          searchQuery={searchQuery}
          {...lineSelectionProps}
        />
      )}
    </div>
  )
}

export default DeploymentLogStepRow
