import { type QueryClient } from '@tanstack/react-query'
import { AttachAddon } from '@xterm/addon-attach'
import { useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Icon, LoaderSpinner, XTerm, toast } from '@qovery/shared/ui'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
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
  const { setOpen } = useContext(ServiceTerminalContext)
  const [attachAddon, setAttachAddon] = useState<AttachAddon | undefined>(undefined)
  const [websocketOpen, setWebsocketOpen] = useState(false)

  const onOpenHandler = useCallback(
    (_: QueryClient, event: Event) => {
      const websocket = event.target as WebSocket
      setAttachAddon((prev) => (!prev ? new AttachAddon(websocket) : prev))
      setWebsocketOpen(true)
    },
    [setWebsocketOpen, setAttachAddon]
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
    },
    onOpen: onOpenHandler,
    onClose: onCloseHandler,
  })

  return createPortal(
    <div className="fixed bottom-0 left-0 w-full animate-slidein-up-md-faded">
      <div className="flex justify-between h-11 px-4 py-2 bg-neutral-650">
        {/* TODO: add pod_name select */}
        <span></span>
        <Button color="neutral" onClick={() => setOpen(false)}>
          Close shell
          <Icon iconName="xmark" className="ml-2 text-sm" />
        </Button>
      </div>
      <div className="bg-neutral-700 px-4 py-2  min-h-[272px]">
        {attachAddon && websocketOpen ? (
          <XTerm addons={[attachAddon]} />
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
