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

interface TerminalShellActionLink {
  action: () => void
  label: string
}

class TerminalShellActionsAddon implements ITerminalAddon {
  private linkProviderDisposable?: IDisposable
  private static readonly ANSI_BOLD = '\u001b[1m'
  private static readonly ANSI_RESET = '\u001b[0m'

  constructor(
    private readonly links: TerminalShellActionLink[],
    private readonly shouldWriteBanner: boolean
  ) {}

  activate(terminal: Terminal): void {
    if (this.shouldWriteBanner) {
      const horizontalPadding = 1
      const actionLabels = this.links.map(({ label }) => label)
      const headingLine = 'Quick actions to get started:'
      const maxContentWidth = Math.max(1, terminal.cols - 4 - horizontalPadding * 2)
      const actionLines: string[] = []
      let currentActionLine = ''

      actionLabels.forEach((label) => {
        const nextLine = currentActionLine ? `${currentActionLine} ${label}` : label

        if (nextLine.length <= maxContentWidth) {
          currentActionLine = nextLine
          return
        }

        if (currentActionLine) {
          actionLines.push(currentActionLine)
        }
        currentActionLine = label
      })

      if (currentActionLine) {
        actionLines.push(currentActionLine)
      }

      const bannerLines = ['Qovery cloud shell', '', headingLine, ...actionLines]
      const maxBannerLineLength = Math.max(...bannerLines.map((line) => line.length))
      const bannerContentWidth = Math.min(Math.max(20, maxBannerLineLength), maxContentWidth)
      const bannerInnerWidth = bannerContentWidth + horizontalPadding * 2
      const lineContentWidth = bannerInnerWidth + 2
      const formatBannerLine = (line: string, bold?: boolean) => {
        const visibleLine = line.length > bannerContentWidth ? line.slice(0, bannerContentWidth) : line
        const trailingPadding = ' '.repeat(bannerContentWidth - visibleLine.length)
        const styledText = bold
          ? `${TerminalShellActionsAddon.ANSI_BOLD}${visibleLine}${TerminalShellActionsAddon.ANSI_RESET}${trailingPadding}`
          : `${visibleLine}${trailingPadding}`

        return `│ ${' '.repeat(horizontalPadding)}${styledText}${' '.repeat(horizontalPadding)} │`
      }

      terminal.writeln(`┌${'─'.repeat(lineContentWidth)}┐`)
      terminal.writeln(formatBannerLine(''))
      bannerLines.forEach((line, index) => terminal.writeln(formatBannerLine(line, index === 0)))
      terminal.writeln(formatBannerLine(''))
      terminal.writeln(`└${'─'.repeat(lineContentWidth)}┘`)
      terminal.writeln('')
    }

    this.linkProviderDisposable = terminal.registerLinkProvider({
      provideLinks: (bufferLineNumber, callback) => {
        const line = terminal.buffer.active.getLine(bufferLineNumber - 1)

        if (!line) {
          callback(undefined)
          return
        }

        const lineText = line.translateToString(false)
        const lineLinks = this.links.flatMap(({ label, action }) => {
          const linkRanges = []
          let fromIndex = 0

          while (fromIndex < lineText.length) {
            const labelIndex = lineText.indexOf(label, fromIndex)
            if (labelIndex === -1) {
              break
            }

            linkRanges.push({
              activate: () => action(),
              decorations: {
                pointerCursor: true,
                underline: false,
              },
              range: {
                end: {
                  x: labelIndex + label.length + 1,
                  y: bufferLineNumber,
                },
                start: {
                  x: labelIndex + 1,
                  y: bufferLineNumber,
                },
              },
              text: label,
            })
            fromIndex = labelIndex + label.length
          }

          return linkRanges
        })

        callback(lineLinks.length > 0 ? lineLinks : undefined)
      },
    })
  }

  dispose(): void {
    this.linkProviderDisposable?.dispose()
    this.linkProviderDisposable = undefined
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
  const portForwardCommand = [
    'qovery port-forward \\',
    `  --organization "${organizationId}" \\`,
    `  --project "${projectId}" \\`,
    `  --environment "${environmentId}" \\`,
    `  --service "${serviceId}" \\`,
    '  --port [local-port]:[target-port]',
  ].join('\n')
  const prefillCommand = useCallback((command: string) => {
    if (!terminalRef.current) {
      return
    }
    terminalRef.current.focus()
    terminalRef.current.paste(`\u0015${command}`)
  }, [])
  const terminalShellLinks = useMemo(
    () => [
      {
        label: '[connect locally]',
        action: () => prefillCommand(connectShellCommand),
      },
      {
        label: '[forward port]',
        action: () => prefillCommand(portForwardCommand),
      },
      {
        label: '[show env variables]',
        action: () => prefillCommand('printenv'),
      },
    ],
    [connectShellCommand, portForwardCommand, prefillCommand]
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
        new TerminalShellActionsAddon(terminalShellLinks, shouldWriteShellBanner),
      ])
    },
    [attachWebSocket, setAddons, terminalShellLinks]
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
