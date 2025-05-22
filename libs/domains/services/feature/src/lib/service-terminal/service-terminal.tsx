import { type QueryClient } from '@tanstack/react-query'
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { type ITerminalAddon } from '@xterm/xterm'
import { type MouseEvent as MouseDownEvent, memo, useCallback, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { XTerm } from 'react-xtermjs'
import { Button, Icon, LoaderSpinner, toast } from '@qovery/shared/ui'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useRunningStatus } from '../..'
import { InputSearch } from './input-search/input-search'
import { ServiceTerminalContext } from './service-terminal-provider'

const MemoizedXTerm = memo(XTerm)

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
  const { data: runningStatuses, isLoading: isRunningStatusesLoading } = useRunningStatus({ environmentId, serviceId })

  const { setOpen } = useContext(ServiceTerminalContext)
  const MIN_TERMINAL_HEIGHT = 248
  const MAX_TERMINAL_HEIGHT = document.body.clientHeight - 64 - 60 // 64 (navbar) + 60 (terminal header)
  const [terminalParentHeight, setTerminalParentHeight] = useState(MIN_TERMINAL_HEIGHT)
  const [addons, setAddons] = useState<Array<ITerminalAddon>>([])
  const isTerminalLoading = addons.length < 2 || isRunningStatusesLoading
  const fitAddon = addons[0] as FitAddon | undefined

  const [selectedPod, setSelectedPod] = useState<string | undefined>()
  const [selectedContainer, setSelectedContainer] = useState<string | undefined>()

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
      <div className="flex h-11 justify-between border-y border-neutral-500 px-4 py-2">
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
        <div className="flex items-center gap-1">
          {fitAddon && (
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
      <div className="min-h-[248px] bg-neutral-700 px-4 py-2" style={{ height: terminalParentHeight }}>
        {isTerminalLoading ? (
          <div className="flex h-40 items-start justify-center p-5">
            <LoaderSpinner />
          </div>
        ) : (
          <MemoizedXTerm className="h-full" addons={addons} />
        )}
      </div>
    </div>,
    document.body
  )
}

export default ServiceTerminal
