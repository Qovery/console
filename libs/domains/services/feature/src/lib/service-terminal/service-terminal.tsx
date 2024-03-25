import { useAuth0 } from '@auth0/auth0-react'
import { AttachAddon } from '@xterm/addon-attach'
import { useCallback, useEffect, useState } from 'react'
import { Terminal } from '@qovery/shared/ui'

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
    onInit()
  }, [onInit])

  if (!attachAddon) {
    return null
  }

  return (
    <div className="fixed bottom-0 w-full">
      <Terminal addons={[attachAddon]} />
    </div>
  )
}

export default ServiceTerminal
