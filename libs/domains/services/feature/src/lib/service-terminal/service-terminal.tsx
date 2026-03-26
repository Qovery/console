import { type QueryClient } from '@tanstack/react-query'
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { type IDisposable, type ITerminalAddon, type Terminal } from '@xterm/xterm'
import Color from 'color'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { XTerm } from 'react-xtermjs'
import { ExternalLink, Icon, LoaderSpinner, toast } from '@qovery/shared/ui'
import { useTerminalReadiness } from '@qovery/shared/util-hooks'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useRunningStatus } from '../..'
import { InputSearch } from './input-search/input-search'

const MemoizedXTerm = memo(XTerm)

class TerminalRefAddon implements ITerminalAddon {
  constructor(
    private readonly onTerminalReady?: (terminal: Terminal) => void,
    private readonly onTerminalDispose?: () => void
  ) {}

  activate(terminal: Terminal): void {
    this.onTerminalReady?.(terminal)
  }

  dispose(): void {
    this.onTerminalDispose?.()
  }
}

interface TerminalBannerColors {
  accent1: string
  positive: string
  subtle: string
  warning: string
}

interface TerminalBannerSegment {
  bold?: boolean
  color?: string
  text: string
}

class TerminalShellActionsAddon implements ITerminalAddon {
  private static readonly COPY_COMMAND_LABEL = '[copy command]'
  private static readonly FIRST_COMMAND_TITLE = '1. Use $ qovery shell'
  private static readonly SECOND_COMMAND_TITLE = '2. Use $ qovery port-forward'
  private static readonly LOOKBACK_LINE_COUNT = 6

  private linkProviderDisposable?: IDisposable
  private resizeDisposable?: IDisposable
  private bannerRenderTimeoutId?: ReturnType<typeof setTimeout>
  private hasRenderedBanner = false
  private static readonly ANSI_BOLD = '\u001b[1m'
  private static readonly ANSI_RESET = '\u001b[0m'

  constructor(
    private readonly fitAddon: FitAddon,
    private readonly colors: TerminalBannerColors,
    private readonly onCopyPortForwardCommand: () => void,
    private readonly onCopyShellCommand: () => void,
    private readonly shouldWriteBanner: boolean
  ) {}

  private toAnsiColor(color: string): string {
    const [r, g, b] = Color(color)
      .rgb()
      .array()
      .map((value) => Math.round(value))

    return `\u001b[38;2;${r};${g};${b}m`
  }

  private formatSegment(segment: TerminalBannerSegment): string {
    const stylePrefix = `${segment.bold ? TerminalShellActionsAddon.ANSI_BOLD : ''}${segment.color ? this.toAnsiColor(segment.color) : ''}`
    if (!stylePrefix) {
      return segment.text
    }

    return `${stylePrefix}${segment.text}${TerminalShellActionsAddon.ANSI_RESET}`
  }

  private clampSegments(segments: TerminalBannerSegment[], maxWidth: number): {
    clippedSegments: TerminalBannerSegment[]
    trailingPadding: string
  } {
    const clippedSegments: TerminalBannerSegment[] = []
    let remainingWidth = maxWidth

    segments.forEach((segment) => {
      if (remainingWidth <= 0) {
        return
      }

      const clippedText = segment.text.slice(0, remainingWidth)
      if (!clippedText) {
        return
      }

      clippedSegments.push({
        ...segment,
        text: clippedText,
      })
      remainingWidth -= clippedText.length
    })

    return {
      clippedSegments,
      trailingPadding: ' '.repeat(Math.max(0, remainingWidth)),
    }
  }

  private wrapSegments(segments: TerminalBannerSegment[], maxWidth: number): TerminalBannerSegment[][] {
    if (!segments.some((segment) => segment.text.length > 0)) {
      return [[{ text: '' }]]
    }

    const wrappedLines: TerminalBannerSegment[][] = []
    let currentLine: TerminalBannerSegment[] = []
    let remainingWidth = maxWidth

    segments.forEach((segment) => {
      let remainingText = segment.text

      while (remainingText.length > 0) {
        if (remainingWidth <= 0) {
          wrappedLines.push(currentLine)
          currentLine = []
          remainingWidth = maxWidth
        }

        const chunkLength = Math.min(remainingWidth, remainingText.length)
        const chunk = remainingText.slice(0, chunkLength)

        currentLine.push({
          ...segment,
          text: chunk,
        })

        remainingText = remainingText.slice(chunkLength)
        remainingWidth -= chunkLength
      }
    })

    if (currentLine.length > 0) {
      wrappedLines.push(currentLine)
    }

    return wrappedLines.length > 0 ? wrappedLines : [[{ text: '' }]]
  }

  private resolveCopyCommandAction(terminal: Terminal, bufferLineNumber: number): (() => void) | undefined {
    const contextLines = Array.from({ length: TerminalShellActionsAddon.LOOKBACK_LINE_COUNT }, (_, index) =>
      terminal.buffer.active.getLine(bufferLineNumber - 2 - index)?.translateToString(false)
    )
      .filter((line): line is string => Boolean(line))
      .join(' ')

    if (contextLines.includes(TerminalShellActionsAddon.SECOND_COMMAND_TITLE)) {
      return this.onCopyPortForwardCommand
    }

    if (contextLines.includes(TerminalShellActionsAddon.FIRST_COMMAND_TITLE)) {
      return this.onCopyShellCommand
    }

    return undefined
  }

  private writeBanner(terminal: Terminal): void {
    const horizontalPadding = 1
    const maxContentWidth = Math.max(1, terminal.cols - 4 - horizontalPadding * 2)
    const bannerContentWidth = maxContentWidth
    const bannerInnerWidth = bannerContentWidth + horizontalPadding * 2
    const lineContentWidth = bannerInnerWidth + 2
    const formatBannerLine = (segments: TerminalBannerSegment[]) => {
      const { clippedSegments, trailingPadding } = this.clampSegments(segments, bannerContentWidth)
      const styledText = clippedSegments.map((segment) => this.formatSegment(segment)).join('') + trailingPadding

      return `│ ${' '.repeat(horizontalPadding)}${styledText}${' '.repeat(horizontalPadding)} │`
    }

    const firstCommandLine: TerminalBannerSegment[] = [
      { bold: true, color: this.colors.warning, text: `${TerminalShellActionsAddon.FIRST_COMMAND_TITLE} ` },
      { color: this.colors.accent1, text: '<service-url> ' },
      { color: this.colors.positive, text: '--pod ' },
      { color: this.colors.accent1, text: '<pod-name> ' },
      { color: this.colors.positive, text: '--container ' },
      { color: this.colors.accent1, text: '<container-id>' },
    ]

    const secondCommandLine: TerminalBannerSegment[] = [
      { bold: true, color: this.colors.warning, text: `${TerminalShellActionsAddon.SECOND_COMMAND_TITLE} ` },
      { color: this.colors.positive, text: '--organization ' },
      { color: this.colors.accent1, text: '<org-id> ' },
      { color: this.colors.positive, text: '--project ' },
      { color: this.colors.accent1, text: '<project-id> ' },
      { color: this.colors.positive, text: '--environment ' },
      { color: this.colors.accent1, text: '<env-id> ' },
      { color: this.colors.positive, text: '--service ' },
      { color: this.colors.accent1, text: '<service-id> ' },
      { color: this.colors.positive, text: '--port ' },
      { color: this.colors.accent1, text: '<local-port:target-port>' },
    ]

    const bannerLines: TerminalBannerSegment[][] = [
      [{ bold: true, text: 'Connect from your local terminal via the Qovery CLI' }],
      [{ text: '' }],
      firstCommandLine,
      [{ color: this.colors.subtle, text: 'Open an interactive shell inside a running container' }],
      [{ text: TerminalShellActionsAddon.COPY_COMMAND_LABEL }],
      [{ text: '' }],
      secondCommandLine,
      [{ color: this.colors.subtle, text: 'Forward a pod port to localhost' }],
      [{ text: TerminalShellActionsAddon.COPY_COMMAND_LABEL }],
    ]

    terminal.writeln(`┌${'─'.repeat(lineContentWidth)}┐`)
    terminal.writeln(formatBannerLine([{ text: '' }]))
    bannerLines.forEach((line) => {
      this.wrapSegments(line, bannerContentWidth).forEach((wrappedLine) => {
        terminal.writeln(formatBannerLine(wrappedLine))
      })
    })
    terminal.writeln(formatBannerLine([{ text: '' }]))
    terminal.writeln(`└${'─'.repeat(lineContentWidth)}┘`)
    terminal.writeln('')
  }

  activate(terminal: Terminal): void {
    if (this.shouldWriteBanner) {
      const renderWhenFitIsStable = () => {
        if (this.bannerRenderTimeoutId) {
          clearTimeout(this.bannerRenderTimeoutId)
        }

        this.bannerRenderTimeoutId = setTimeout(() => {
          if (this.hasRenderedBanner) {
            return
          }

          this.fitAddon.fit()
          this.writeBanner(terminal)
          this.hasRenderedBanner = true
          this.resizeDisposable?.dispose()
          this.resizeDisposable = undefined
        }, 120)
      }

      this.resizeDisposable = terminal.onResize(() => {
        renderWhenFitIsStable()
      })
      renderWhenFitIsStable()
    }

    this.linkProviderDisposable = terminal.registerLinkProvider({
      provideLinks: (bufferLineNumber, callback) => {
        const line = terminal.buffer.active.getLine(bufferLineNumber - 1)

        if (!line) {
          callback(undefined)
          return
        }

        const lineText = line.translateToString(false)
        const linkRanges = []
        let fromIndex = 0

        while (fromIndex < lineText.length) {
          const labelIndex = lineText.indexOf(TerminalShellActionsAddon.COPY_COMMAND_LABEL, fromIndex)
          if (labelIndex === -1) {
            break
          }

          const action = this.resolveCopyCommandAction(terminal, bufferLineNumber)
          if (action) {
            linkRanges.push({
              activate: () => action(),
              decorations: {
                pointerCursor: true,
                underline: false,
              },
              range: {
                end: {
                  x: labelIndex + TerminalShellActionsAddon.COPY_COMMAND_LABEL.length + 1,
                  y: bufferLineNumber,
                },
                start: {
                  x: labelIndex + 1,
                  y: bufferLineNumber,
                },
              },
              text: TerminalShellActionsAddon.COPY_COMMAND_LABEL,
            })
          }

          fromIndex = labelIndex + TerminalShellActionsAddon.COPY_COMMAND_LABEL.length
        }

        callback(linkRanges.length > 0 ? linkRanges : undefined)
      },
    })
  }

  dispose(): void {
    if (this.bannerRenderTimeoutId) {
      clearTimeout(this.bannerRenderTimeoutId)
      this.bannerRenderTimeoutId = undefined
    }

    this.linkProviderDisposable?.dispose()
    this.resizeDisposable?.dispose()
    this.linkProviderDisposable = undefined
    this.resizeDisposable = undefined
  }
}

export interface ServiceTerminalProps {
  organizationId: string
  clusterId: string
  projectId: string
  environmentId: string
  serviceId: string
}

export function ServiceTerminal({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  serviceId,
}: ServiceTerminalProps) {
  const { data: runningStatuses } = useRunningStatus({ environmentId, serviceId })
  const terminalRef = useRef<Terminal | null>(null)
  const hasWrittenShellBannerRef = useRef(false)

  const [addons, setAddons] = useState<Array<ITerminalAddon>>([])
  const isTerminalLoading = addons.length < 2
  const { attachWebSocket, detachWebSocket, isTerminalReady, resetTerminalReadiness } = useTerminalReadiness()
  const showDelayedLoader = !isTerminalReady
  const fitAddon = addons[0] as FitAddon | undefined

  const getCssVariableHex = (variableName: string): string => {
    const styles = getComputedStyle(document.documentElement)
    return Color(styles.getPropertyValue(variableName)).hex()
  }

  const backgroundColor = getCssVariableHex('--background-1')
  const foreground = getCssVariableHex('--neutral-12')
  const selectionBackground = getCssVariableHex('--brand-3')
  const selectionForeground = getCssVariableHex('--neutral-12')
  const warningTextColor = getCssVariableHex('--warning-11')
  const accent1TextColor = getCssVariableHex('--accent-11')
  const positiveTextColor = getCssVariableHex('--positive-11')
  const subtleTextColor = getCssVariableHex('--neutral-11')
  const terminalBannerColors = useMemo(
    () => ({
      accent1: accent1TextColor,
      positive: positiveTextColor,
      subtle: subtleTextColor,
      warning: warningTextColor,
    }),
    [accent1TextColor, positiveTextColor, subtleTextColor, warningTextColor]
  )
  const terminalOptions = useMemo(
    () => ({
      theme: {
        background: backgroundColor,
        foreground: foreground,
        cursor: foreground,
        cursorAccent: backgroundColor,
        selectionBackground: selectionBackground,
        selectionForeground: selectionForeground,
      },
    }),
    [backgroundColor, foreground, selectionBackground, selectionForeground]
  )

  const [selectedPod, setSelectedPod] = useState<string | undefined>()
  const [selectedContainer, setSelectedContainer] = useState<string | undefined>()

  const selectedOrDefaultPodName = selectedPod ?? runningStatuses?.pods[0]?.name
  const selectedOrDefaultContainerName =
    selectedContainer ?? runningStatuses?.pods.find((pod) => pod.name === selectedOrDefaultPodName)?.containers[0]?.name
  const connectShellCommand = [
    `qovery shell https://console.qovery.com/organization/${organizationId}/project/${projectId}/environment/${environmentId}/application/${serviceId}`,
    selectedOrDefaultPodName ? `--pod-name=${selectedOrDefaultPodName}` : undefined,
    selectedOrDefaultContainerName ? `--container=${selectedOrDefaultContainerName}` : undefined,
  ]
    .filter((commandPart): commandPart is string => Boolean(commandPart))
    .join(' ')
  const portForwardCommand = `qovery port-forward --organization ${organizationId} --project ${projectId} --environment ${environmentId} --service ${serviceId} --port <local-port:target-port>`
  const prefillCommand = useCallback((command: string, shouldPasteInTerminal = true) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(command).catch(() => undefined)
    }

    if (!shouldPasteInTerminal) {
      return
    }

    if (!terminalRef.current) {
      return
    }
    terminalRef.current.focus()
    terminalRef.current.paste(`\u0015${command}`)
  }, [])
  const onCopyShellCommand = useCallback(
    () => prefillCommand(connectShellCommand, false),
    [connectShellCommand, prefillCommand]
  )
  const onCopyPortForwardCommand = useCallback(
    () => prefillCommand(portForwardCommand, false),
    [portForwardCommand, prefillCommand]
  )

  const onOpenHandler = useCallback(
    (_: QueryClient, event: Event) => {
      const websocket = event.target as WebSocket
      const fitAddon = new FitAddon()
      const shouldWriteShellBanner = !hasWrittenShellBannerRef.current

      // As WS are open twice in dev mode / strict mode it doesn't happens in production
      attachWebSocket(websocket)
      hasWrittenShellBannerRef.current = true
      setAddons([
        fitAddon,
        new AttachAddon(websocket),
        new TerminalRefAddon(
          (terminal) => {
            terminalRef.current = terminal
          },
          () => {
            terminalRef.current = null
          }
        ),
        new TerminalShellActionsAddon(
          fitAddon,
          terminalBannerColors,
          onCopyPortForwardCommand,
          onCopyShellCommand,
          shouldWriteShellBanner
        ),
      ])
    },
    [attachWebSocket, onCopyPortForwardCommand, onCopyShellCommand, setAddons, terminalBannerColors]
  )

  const onCloseHandler = useCallback(
    (_: QueryClient, event: CloseEvent) => {
      detachWebSocket()

      if (event.code !== 1006 && event.reason) {
        toast('ERROR', 'Not available', event.reason)
      }
    },
    [detachWebSocket]
  )

  // Necesssary to calculate the number of rows and columns (tty) for the terminal
  // https://github.com/xtermjs/xterm.js/issues/1412#issuecomment-724421101
  // 16 is the font height
  const rows = Math.ceil(document.body.clientHeight / 16)
  const cols = Math.ceil(document.body.clientWidth / 8)

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/shell/exec',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      pod_name: selectedPod,
      container_name: selectedContainer,
      tty_height: rows.toString(),
      tty_width: cols.toString(),
    },
    onOpen: onOpenHandler,
    onClose: onCloseHandler,
  })

  useEffect(() => {
    hasWrittenShellBannerRef.current = false
    resetTerminalReadiness()
  }, [resetTerminalReadiness, selectedContainer, selectedPod])

  useEffect(() => {
    if (fitAddon) {
      setTimeout(() => fitAddon.fit(), 0)
    }
  }, [fitAddon])

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none border-0 bg-background">
      <div className="flex h-16 justify-between border-b border-neutral p-4">
        <div className="flex gap-2 [&_input]:w-[400px]">
          {runningStatuses && runningStatuses.pods.length > 0 && (
            <InputSearch
              value={selectedPod}
              onChange={setSelectedPod}
              data={runningStatuses.pods.map((pod) => pod.name)}
              placeholder="Search by pod"
              size="md"
              trimLabel
            />
          )}
          {runningStatuses && selectedPod && (
            <InputSearch
              value={selectedContainer}
              onChange={setSelectedContainer}
              data={
                runningStatuses.pods
                  .find((pod) => selectedPod === pod?.name)
                  ?.containers.map((container) => container?.name) || []
              }
              placeholder="Search by container"
              size="md"
            />
          )}
        </div>
        <ExternalLink
          as="button"
          href="https://www.qovery.com/docs/cli/overview"
          variant="surface"
          color="neutral"
          size="md"
          className="gap-1.5"
        >
          <Icon iconName="book" />
          CLI docs
        </ExternalLink>
      </div>
      <div className="flex h-full flex-1 flex-col bg-background p-3">
        <div className="relative min-h-0 flex-1">
          {isTerminalLoading ? (
            <div className="flex h-40 items-start justify-center p-5">
              <LoaderSpinner />
            </div>
          ) : (
            <>
              <MemoizedXTerm className="h-full" addons={addons} options={terminalOptions} />
              {showDelayedLoader && (
                <div className="absolute inset-0 flex items-start justify-center border-neutral bg-background pt-7">
                  <LoaderSpinner />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceTerminal
