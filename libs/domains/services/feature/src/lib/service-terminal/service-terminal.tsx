import { type QueryClient } from '@tanstack/react-query'
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { type MouseEvent as MouseDownEvent, useCallback, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Icon, LoaderSpinner, XTerm, toast } from '@qovery/shared/ui'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useRunningStatus } from '../..'
import { InputSearch } from './input-search/input-search'
import { ServiceTerminalContext } from './service-terminal-provider'

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
  const MAX_TERMINAL_HEIGHT = document.body.scrollHeight - 64 - 60 // 64 (navbar) + 60 (terminal header)
  const [terminalParentHeight, setTerminalParentHeight] = useState(MIN_TERMINAL_HEIGHT)
  const [attachAddon, setAttachAddon] = useState<AttachAddon | undefined>(undefined)
  const [fitAddon, setFitAddon] = useState<FitAddon | undefined>(undefined)

  const [selectedPod, setSelectedPod] = useState<string | undefined>()
  const [selectedContainer, setSelectedContainer] = useState<string | undefined>()

  const onOpenHandler = useCallback(
    (_: QueryClient, event: Event) => {
      const websocket = event.target as WebSocket
      setAttachAddon(new AttachAddon(websocket))

      const fitAddon = new FitAddon()
      setFitAddon(fitAddon)
      fitAddon.fit()
    },
    [setFitAddon, setAttachAddon]
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
  const rows = Math.ceil(document.body.clientHeight / 18)
  const cols = Math.ceil(document.body.clientWidth / 8)

  useReactQueryWsSubscription({
    url: 'wss://ws.qovery.com/shell/exec',
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

  const handleMouseDown = (mouseDownEvent: MouseDownEvent<HTMLButtonElement>) => {
    const startYPosition = mouseDownEvent.pageY
    const startHeight = terminalParentHeight

    function onMouseMove(mouseMoveEvent: MouseEvent) {
      const deltaY = mouseMoveEvent.pageY - startYPosition
      const newParentHeight = startHeight - deltaY

      setTerminalParentHeight(Math.max(Math.min(newParentHeight, MAX_TERMINAL_HEIGHT), MIN_TERMINAL_HEIGHT))

      fitAddon && fitAddon.fit()
    }

    function onMouseUp() {
      document.body.removeEventListener('mousemove', onMouseMove)
      document.body.removeEventListener('mouseup', onMouseUp)
    }

    document.body.addEventListener('mousemove', onMouseMove)
    document.body.addEventListener('mouseup', onMouseUp)
  }

  // `useMemo` necessary to avoid re-render after terminal resize
  const TerminalMemoized = useMemo(() => {
    if (!attachAddon || !fitAddon || isRunningStatusesLoading) return null

    // Delay needed to fit the terminal after the height change
    setTimeout(() => fitAddon.fit(), 0)

    return (
      <XTerm
        className="h-full"
        onKeyUp={(event) => event.key === 'Escape' && setOpen(false)}
        addons={[attachAddon, fitAddon]}
      />
    )
  }, [attachAddon, fitAddon, isRunningStatusesLoading, setOpen])

  return createPortal(
    <div className="fixed bottom-0 left-0 w-full bg-neutral-650 animate-slidein-up-md-faded">
      <button
        className="flex items-center justify-center h-4 w-full transition-colors bg-neutral-550 hover:bg-neutral-650 border-t border-neutral-500"
        type="button"
        onMouseDown={handleMouseDown}
      >
        <Icon iconName="grip-lines" iconStyle="regular" className="text-white" />
      </button>
      <div className="flex justify-between h-11 px-4 py-2 border-y border-neutral-500">
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
              onClick={() => {
                terminalParentHeight === MAX_TERMINAL_HEIGHT
                  ? setTerminalParentHeight(MIN_TERMINAL_HEIGHT)
                  : setTerminalParentHeight(MAX_TERMINAL_HEIGHT)

                // Delay needed to fit the terminal after the height change
                setTimeout(() => fitAddon.fit(), 0)
              }}
            >
              <Icon
                iconName={terminalParentHeight === MAX_TERMINAL_HEIGHT ? 'chevron-down' : 'chevron-up'}
                className="text-sm"
              />
            </Button>
          )}
          <Button color="neutral" onClick={() => setOpen(false)}>
            Close shell
            <Icon iconName="xmark" className="ml-2 text-sm" />
          </Button>
        </div>
      </div>
      <div className="bg-neutral-700 px-4 py-2 min-h-[248px]" style={{ height: terminalParentHeight }}>
        {TerminalMemoized || (
          <div className="flex items-start justify-center p-5 h-40">
            <LoaderSpinner />
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default ServiceTerminal
