import { type QueryClient } from '@tanstack/react-query'
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { type ITerminalAddon } from '@xterm/xterm'
import { DebugFlavor } from 'qovery-ws-typescript-axios'
import { type MouseEvent as MouseDownEvent, memo, useCallback, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { XTerm } from 'react-xtermjs'
import { Button, Icon, LoaderSpinner, toast } from '@qovery/shared/ui'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import useClusterRunningStatus from '../hooks/use-cluster-running-status/use-cluster-running-status'
import { ClusterTerminalContext } from './cluster-terminal-provider'

const MemoizedXTerm = memo(XTerm)

export interface ClusterTerminalProps {
  organizationId: string
  clusterId: string
}

export function ClusterTerminal({ organizationId, clusterId }: ClusterTerminalProps) {
  const { data: runningStatuses } = useClusterRunningStatus({
    organizationId,
    clusterId,
  })

  const isRunningStatusesLoading = typeof runningStatuses !== 'object'

  const { setOpen } = useContext(ClusterTerminalContext)
  const MIN_TERMINAL_HEIGHT = 248
  const MAX_TERMINAL_HEIGHT = document.body.clientHeight - 64 - 60 // 64 (navbar) + 60 (terminal header)
  const [terminalParentHeight, setTerminalParentHeight] = useState(MIN_TERMINAL_HEIGHT)
  const [addons, setAddons] = useState<Array<ITerminalAddon>>([])
  const isTerminalLoading = addons.length < 2 || isRunningStatusesLoading
  const [showDelayedLoader, setShowDelayedLoader] = useState(true)
  const fitAddon = addons[0] as FitAddon | undefined

  // Lock body scroll when terminal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  // Hack to avoid having connection delay with server
  useEffect(() => {
    if (!isTerminalLoading) {
      const timer = setTimeout(() => setShowDelayedLoader(false), 6_000)
      return () => clearTimeout(timer)
    }
    return () => null
  }, [isTerminalLoading])

  const onOpenHandler = useCallback(
    (_: QueryClient, event: Event) => {
      const websocket = event.target as WebSocket
      const fitAddon = new FitAddon()
      // As WS are open twice in dev mode / strict mode it doesn't happens in production
      setAddons([fitAddon, new AttachAddon(websocket)])
    },
    [setAddons]
  )

  const onCloseHandler = useCallback(
    (_: QueryClient, event: CloseEvent) => {
      if (event.code !== 1006 && event.reason) {
        toast('ERROR', 'Not available', event.reason)
        setOpen(false)
      }
    },
    [setOpen]
  )

  // Necesssary to calculate the number of rows and columns (tty) for the terminal
  // https://github.com/xtermjs/xterm.js/issues/1412#issuecomment-724421101
  // 14 is the font height for better k9s compatibility
  const rows = Math.ceil(document.body.clientHeight / 14)
  // 9 is the font width for better k9s compatibility, with a minimum width of 80 columns
  const cols = Math.max(80, Math.ceil(document.body.clientWidth / 9))

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/shell/debug',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      flavor: DebugFlavor.FULL_PRIVILEGE,
      tty_height: rows.toString(),
      tty_width: cols.toString(),
    },
    onOpen: onOpenHandler,
    onClose: onCloseHandler,
  })

  useEffect(() => {
    if (fitAddon) {
      setTimeout(() => fitAddon.fit(), 0)
    }
  }, [terminalParentHeight, fitAddon])

  const handleMouseDown = (mouseDownEvent: MouseDownEvent<HTMLButtonElement>) => {
    const startYPosition = mouseDownEvent.pageY
    const startHeight = terminalParentHeight

    function onMouseMove(mouseMoveEvent: MouseEvent) {
      const deltaY = mouseMoveEvent.pageY - startYPosition
      const newParentHeight = startHeight - deltaY

      setTerminalParentHeight(Math.max(Math.min(newParentHeight, MAX_TERMINAL_HEIGHT), MIN_TERMINAL_HEIGHT))
    }

    function onMouseUp() {
      document.body.removeEventListener('mousemove', onMouseMove)
      document.body.removeEventListener('mouseup', onMouseUp)
    }

    document.body.addEventListener('mousemove', onMouseMove)
    document.body.addEventListener('mouseup', onMouseUp)
  }

  return createPortal(
    <div className="dark fixed bottom-0 left-0 w-full animate-slidein-up-md-faded bg-neutral-650">
      <button
        className="flex h-4 w-full items-center justify-center border-t border-neutral-500 bg-neutral-550 transition-colors hover:bg-neutral-650"
        type="button"
        onMouseDown={handleMouseDown}
      >
        <Icon iconName="grip-lines" iconStyle="regular" className="text-white" />
      </button>
      <div className="flex h-11 justify-end border-y border-neutral-500 px-4 py-2">
        <div className="flex items-center gap-1">
          {fitAddon && !showDelayedLoader && (
            <Button
              color="neutral"
              variant="surface"
              onClick={() => {
                terminalParentHeight === MAX_TERMINAL_HEIGHT
                  ? setTerminalParentHeight(MIN_TERMINAL_HEIGHT)
                  : setTerminalParentHeight(MAX_TERMINAL_HEIGHT)
              }}
            >
              <Icon
                iconName={terminalParentHeight === MAX_TERMINAL_HEIGHT ? 'chevron-down' : 'chevron-up'}
                className="text-sm"
              />
            </Button>
          )}
          <Button color="neutral" variant="surface" onClick={() => setOpen(false)}>
            Close shell
            <Icon iconName="xmark" className="ml-2 text-sm" />
          </Button>
        </div>
      </div>
      <div className="relative min-h-[248px] bg-neutral-700 px-4 py-2" style={{ height: terminalParentHeight }}>
        {isTerminalLoading ? (
          <div className="flex h-40 items-start justify-center p-5">
            <LoaderSpinner />
          </div>
        ) : (
          <>
            <MemoizedXTerm className="h-full" addons={addons} />
            {showDelayedLoader && (
              <div className="absolute inset-0 flex items-start justify-center bg-neutral-700 pt-7">
                <LoaderSpinner />
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

export default ClusterTerminal
