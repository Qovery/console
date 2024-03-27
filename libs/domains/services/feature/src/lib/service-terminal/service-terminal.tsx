import { useAuth0 } from '@auth0/auth0-react'
import { AttachAddon } from '@xterm/addon-attach'
import { useContext, useEffect, useState } from 'react'
import { Button, Icon, LoaderSpinner, XTerm, toast } from '@qovery/shared/ui'
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
  const [haveMessage, setHaveMessage] = useState(false)
  const { getAccessTokenSilently } = useAuth0()

  // Initialization WS for Shell
  // useReactQueryWsSubscription({
  //   url: 'wss://ws.qovery.com/shell/exec',
  //   urlSearchParams: {
  //     organization: organizationId,
  //     cluster: clusterId,
  //     project: projectId,
  //     environment: environmentId,
  //     service: serviceId,
  //   },
  // onOpen: (_, event, webSocket) => {
  //   if (event) setAttachAddon(new AttachAddon(webSocket))
  // },
  // onMessage: (_, event) => {
  //   console.log('Message from server:', event.data)
  // },
  // onError: (_, event) => {
  //   console.log('WebSocket error:', event)
  // },
  // })

  useEffect(() => {
    let socket: WebSocket

    const fetchShellUrl = async () => {
      const url = `wss://ws.qovery.com/shell/exec?organization=${organizationId}&cluster=${clusterId}&project=${projectId}&environment=${environmentId}&service=${serviceId}`
      const token = await getAccessTokenSilently()
      return url + `&bearer_token=${token}`
    }

    const listenerOpen = () => setAttachAddon(new AttachAddon(socket))
    const listenerMessage = () => setHaveMessage(true)
    const listenerError = (errorEvent: Event) => console.error('WebSocket error:', errorEvent)
    const listenerClose = (closeEvent: CloseEvent) => {
      toast('WARNING', 'Not available', closeEvent.reason)
      setOpen(false)
    }

    const onInit = async () => {
      const shellUrl = await fetchShellUrl()
      socket = new WebSocket(shellUrl)

      socket.addEventListener('open', listenerOpen)
      socket.addEventListener('message', listenerMessage)
      socket.addEventListener('error', listenerError)
      socket.addEventListener('close', listenerClose)
    }

    onInit()

    return () => {
      if (socket) {
        socket.removeEventListener('open', listenerOpen)
        socket.removeEventListener('message', listenerMessage)
        socket.removeEventListener('error', listenerError)
        socket.removeEventListener('close', listenerClose)
        socket.close()
      }
    }
  }, [clusterId, environmentId, getAccessTokenSilently, organizationId, projectId, serviceId, setOpen])

  if (!attachAddon) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 w-full animate-slidein-up-md-faded">
      <div className="flex justify-between h-11 px-4 py-2 bg-neutral-650">
        <span></span>
        <Button color="neutral" onClick={() => setOpen(false)}>
          Close shell
          <Icon iconName="xmark" className="ml-2 text-sm" />
        </Button>
      </div>
      <div className="bg-neutral-700 px-4 py-2  min-h-[272px]">
        {haveMessage ? (
          <XTerm addons={[attachAddon]} />
        ) : (
          <div className="flex items-start justify-center p-5 h-40">
            <LoaderSpinner />
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceTerminal
