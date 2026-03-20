import { type QueryClient } from '@tanstack/react-query'
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { type ITerminalAddon } from '@xterm/xterm'
import Color from 'color'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { XTerm } from 'react-xtermjs'
import { LoaderSpinner, toast } from '@qovery/shared/ui'
import { useTerminalReadiness } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useRunningStatus } from '../..'
import { InputSearch } from './input-search/input-search'

const MemoizedXTerm = memo(XTerm)

export interface ServiceTerminalProps {
  organizationId: string
  clusterId: string
  projectId: string
  environmentId: string
  serviceId: string
  className?: string
  backgroundClassName?: string
}

export function ServiceTerminal({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  serviceId,
  className,
  backgroundClassName = 'bg-background',
}: ServiceTerminalProps) {
  const { data: runningStatuses } = useRunningStatus({ environmentId, serviceId })

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
    resetTerminalReadiness()
  }, [resetTerminalReadiness, selectedContainer, selectedPod])

  useEffect(() => {
    if (fitAddon) {
      setTimeout(() => fitAddon.fit(), 0)
    }
  }, [fitAddon])

  return (
    <div
      className={twMerge(
        'flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded border border-neutral',
        backgroundClassName,
        className
      )}
    >
      <div className="flex h-11 justify-between border-b border-neutral px-4 py-2">
        <div className="flex gap-2">
          {runningStatuses && runningStatuses.pods.length > 0 && (
            <InputSearch
              value={selectedPod}
              onChange={setSelectedPod}
              data={runningStatuses.pods.map((pod) => pod.name)}
              placeholder="Search by pod"
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
            />
          )}
        </div>
      </div>
      <div
        className={twMerge('relative min-h-[248px] flex-1 border-neutral px-4 py-2', backgroundClassName)}
        style={{ height: '100%' }}
      >
        {isTerminalLoading ? (
          <div className="flex h-40 items-start justify-center p-5">
            <LoaderSpinner />
          </div>
        ) : (
          <>
            <MemoizedXTerm className="h-full" addons={addons} options={terminalOptions} />
            {showDelayedLoader && (
              <div
                className={twMerge(
                  'absolute inset-0 flex items-start justify-center border-neutral pt-7',
                  backgroundClassName
                )}
              >
                <LoaderSpinner />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ServiceTerminal
