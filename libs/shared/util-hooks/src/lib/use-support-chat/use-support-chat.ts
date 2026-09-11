import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useMemo } from 'react'

type PylonChatSettings = {
  app_id?: string
  email?: string
  email_hash?: string
  name?: string
  avatar_url?: string
}

type PylonCommand = {
  (cmd: 'showTicketForm', formSlug: string): void
  (cmd: 'show' | 'hide'): void
  e?: (args: unknown[]) => void
  q?: unknown[][]
}

declare global {
  interface Window {
    pylon?: {
      chat_settings: PylonChatSettings
    }
    Pylon?: PylonCommand
  }
}

export function useSupportChat() {
  const { user } = useAuth0()

  const defaultChatParams = useMemo(() => {
    if (!user) return undefined

    return {
      app_id: process.env.NX_PUBLIC_PYLON_APP_ID,
      email: user.email,
      name: user.name,
      email_hash: user['https://qovery.com/pylon_hash'],
      avatar_url: user.picture,
    }
  }, [user])

  const initChat = () => {
    bootstrapPylon(defaultChatParams)
  }

  const whenPylonReady = (callback: () => void) => {
    if (isPylonReady()) {
      callback()
      return
    }

    bootstrapPylon(defaultChatParams)
    callback()
  }

  const showChat = () => {
    whenPylonReady(() => window.Pylon?.('show'))
  }

  const showPylonForm = (formSlug: string) => {
    whenPylonReady(() => window.Pylon?.('showTicketForm', formSlug))
  }

  const isPylonReady = () => Boolean(window.Pylon && !window.Pylon.q)

  const setPylonChatSettings = (settings?: PylonChatSettings) => {
    if (!settings) return

    window.pylon = {
      chat_settings: { ...window.pylon?.chat_settings, ...settings },
    }
  }

  const bootstrapPylon = (settings?: PylonChatSettings) => {
    setPylonChatSettings(settings)

    if (!window.Pylon) {
      const pylonQueue = ((...args: unknown[]) => pylonQueue.e?.(args)) as PylonCommand

      pylonQueue.q = []
      pylonQueue.e = (args) => pylonQueue.q?.push(args)
      window.Pylon = pylonQueue
    }

    insertPylonScriptTag()
  }

  const insertPylonScriptTag = () => {
    if (document.getElementById('pylon-script')) return

    const tag = document.createElement('script')
    tag.setAttribute('type', 'text/javascript')
    tag.setAttribute('async', 'true')
    tag.setAttribute('id', 'pylon-script')
    tag.setAttribute('src', `https://widget.usepylon.com/widget/${process.env.NX_PUBLIC_PYLON_APP_ID}`)

    const mainScriptTag: HTMLScriptElement | undefined = document.getElementsByTagName('script')[0]

    mainScriptTag?.parentNode?.insertBefore(tag, mainScriptTag)
  }

  const updateUserInfo = (settings?: PylonChatSettings) => {
    if (!settings) return

    setPylonChatSettings({ ...defaultChatParams, ...settings })
  }

  useEffect(() => {
    bootstrapPylon(defaultChatParams)
  }, [defaultChatParams])

  return { updateUserInfo, showChat, initChat, showPylonForm }
}
