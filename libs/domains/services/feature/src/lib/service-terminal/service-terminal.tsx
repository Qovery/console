import { type QueryClient } from '@tanstack/react-query'
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { useCallback, useContext, useMemo, useState } from 'react'
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
  const [attachAddon, setAttachAddon] = useState<AttachAddon | undefined>(undefined)
  const [fitAddon, setFitAddon] = useState<FitAddon | undefined>(undefined)

  const [selectedPod, setSelectedPod] = useState<string | undefined>()
  const [selectedContainer, setSelectedContainer] = useState<string | undefined>()

  const onOpenHandler = useCallback(
    (_: QueryClient, event: Event) => {
      const websocket = event.target as WebSocket
      setAttachAddon(new AttachAddon(websocket))
      // Resize the terminal to fit the new height
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
    },
    onOpen: onOpenHandler,
    onClose: onCloseHandler,
  })

  const [terminalParentHeight, setTerminalParentHeight] = useState(248)
  /* 
    Document height without navbar height and terminal header
    64px: navbar
    60px: terminal header
  */
  const maxTerminalHeight = document.body.scrollHeight - 64 - 60

  const handler = (mouseDownEvent: any) => {
    const startYPosition = mouseDownEvent.pageY
    const startHeight = terminalParentHeight

    function onMouseMove(mouseMoveEvent: any) {
      const deltaY = mouseMoveEvent.pageY - startYPosition

      const newParentHeight = startHeight - deltaY

      if (newParentHeight >= maxTerminalHeight) {
        setTerminalParentHeight(maxTerminalHeight)
      } else if (newParentHeight <= 248) {
        setTerminalParentHeight(248)
      } else {
        setTerminalParentHeight(newParentHeight)
      }

      fitAddon && fitAddon.fit()
    }

    function onMouseUp() {
      document.body.removeEventListener('mousemove', onMouseMove)
      document.body.removeEventListener('mouseup', onMouseUp)
    }

    document.body.addEventListener('mousemove', onMouseMove)
    document.body.addEventListener('mouseup', onMouseUp)
  }

  const TerminalMemorized = useMemo(
    () =>
      attachAddon &&
      fitAddon && (
        <XTerm
          className="h-full"
          onKeyUp={(event) => event.key === 'Escape' && setOpen(false)}
          addons={[attachAddon, fitAddon]}
          options={{
            rows: 14,
            cols: 80,
          }}
        />
      ),
    [attachAddon, fitAddon, setOpen]
  )

  return createPortal(
    <div className="fixed bottom-0 left-0 w-full bg-neutral-650 animate-slidein-up-md-faded">
      <button
        className="flex items-center justify-center h-4 w-full transition-colors bg-neutral-550 hover:bg-neutral-650 border-t border-neutral-500"
        type="button"
        onMouseDown={handler}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
          <path
            fill="#fff"
            d="M12 4.286a.43.43 0 00-.429-.429H.43A.43.43 0 000 4.286a.43.43 0 00.429.429H11.57A.43.43 0 0012 4.286zm0 3.429a.43.43 0 00-.429-.429H.43A.43.43 0 000 7.715a.43.43 0 00.429.428H11.57A.43.43 0 0012 7.715z"
          ></path>
        </svg>
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
          {attachAddon && fitAddon && (
            <Button
              color="neutral"
              onClick={() => {
                terminalParentHeight === maxTerminalHeight
                  ? setTerminalParentHeight(248)
                  : setTerminalParentHeight(maxTerminalHeight)
                // Delay needed to fit the terminal after the height change
                setTimeout(() => fitAddon.fit(), 0)
              }}
            >
              <Icon iconName={terminalParentHeight === maxTerminalHeight ? 'minus' : 'plus'} className="text-sm" />
            </Button>
          )}
          <Button color="neutral" onClick={() => setOpen(false)}>
            Close shell
            <Icon iconName="xmark" className="ml-2 text-sm" />
          </Button>
        </div>
      </div>
      <div className="bg-neutral-700 px-4 py-2 min-h-[248px]" style={{ height: terminalParentHeight }}>
        {attachAddon && fitAddon && !isRunningStatusesLoading ? (
          TerminalMemorized
        ) : (
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
