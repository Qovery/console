import { type QueryClient } from '@tanstack/react-query'
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { type ITerminalAddon } from '@xterm/xterm'
import Color from 'color'
import { DebugFlavor } from 'qovery-ws-typescript-axios'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { XTerm } from 'react-xtermjs'
import { LoaderSpinner, toast } from '@qovery/shared/ui'
import { useTerminalReadiness } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

const MemoizedXTerm = memo(XTerm)

export interface ClusterTerminalProps {
  organizationId: string
  clusterId: string
  className?: string
}

export function ClusterTerminal({ organizationId, clusterId, className }: ClusterTerminalProps) {
  const [addons, setAddons] = useState<Array<ITerminalAddon>>([])
  const isTerminalLoading = addons.length < 2
  const { attachWebSocket, detachWebSocket, isTerminalReady } = useTerminalReadiness()
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

  const onOpenHandler = useCallback(
    (_: QueryClient, event: Event) => {
      const websocket = event.target as WebSocket
      const fitAddon = new FitAddon()
      // As WS are open twice in dev mode / strict mode it doesn't happens in production
      attachWebSocket(websocket)
      setAddons([fitAddon, new AttachAddon(websocket)])
    },
    [attachWebSocket, setAddons]
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
  }, [fitAddon])

  return (
    <div
      className={twMerge(
        'flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded border border-neutral bg-background',
        className
      )}
    >
      <div className="relative flex-1 border-neutral bg-background px-4 py-2" style={{ height: '100%' }}>
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
  )
}

export default ClusterTerminal
