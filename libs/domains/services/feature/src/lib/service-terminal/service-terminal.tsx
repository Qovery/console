import { useAuth0 } from '@auth0/auth0-react'
import { AttachAddon } from '@xterm/addon-attach'
import { useCallback, useEffect, useState } from 'react'
import { Button, Icon, Terminal, useTerminal } from '@qovery/shared/ui'

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
  const [openTerminal, setOpenTerminal] = useState<boolean>(false)
  const { instance } = useTerminal()
  const [attachAddon, setAttachAddon] = useState<AttachAddon | undefined>(undefined)
  const { getAccessTokenSilently } = useAuth0()

  const fetchShellUrl = useCallback(async () => {
    const url = `wss://ws.qovery.com/shell/exec?organization=${organizationId}&cluster=${clusterId}&project=${projectId}&environment=${environmentId}&service=${serviceId}`
    const token = await getAccessTokenSilently()
    return url + `&bearer_token=${token}`
  }, [organizationId, clusterId, projectId, environmentId, serviceId, getAccessTokenSilently])

  const onInit = useCallback(async () => {
    const shellUrl = await fetchShellUrl()
    const socket = new WebSocket(shellUrl)

    socket.addEventListener('open', () => {
      console.log('WebSocket opened')

      setOpenTerminal(true)
      setAttachAddon(new AttachAddon(socket))
    })

    socket.addEventListener('message', (event: MessageEvent) => {
      console.log('Message from server:', event.data)
    })

    socket.addEventListener('error', (errorEvent) => {
      console.log('WebSocket error:', errorEvent)
    })

    socket.addEventListener('close', (closeEvent) => {
      console.log('WebSocket closed:', closeEvent)
    })
  }, [fetchShellUrl])

  useEffect(() => {
    if (instance) onInit()
  }, [instance, onInit])

  if (!attachAddon || !openTerminal) {
    return null
  }

  return (
    <div className="dark fixed bottom-0 left-0 w-full">
      <div className="flex justify-between h-11 px-4 py-2 bg-neutral-650">
        <span className="text-neutral-100">Search pod name</span>
        <Button
          color="neutral"
          onClick={() => {
            setOpenTerminal(false)
            instance.dispose()
          }}
        >
          Close shell
          <Icon iconName="xmark" className="ml-2 text-sm" />
        </Button>
      </div>
      <div className="bg-neutral-700 px-4 py-2">
        <Terminal addons={[attachAddon]} />
      </div>
    </div>
  )
}

export default ServiceTerminal
