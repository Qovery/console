import { useAuth0 } from '@auth0/auth0-react'
import { useMatches } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo } from 'react'
import { type IntercomProps, useIntercom } from 'react-use-intercom'

type IntercomChatSettings = Partial<IntercomProps>

type PylonChatSettings = {
  app_id?: string
  email?: string
  email_hash?: string
  name?: string
  avatar_url?: string
}

type ChatSettings = IntercomChatSettings | PylonChatSettings
type PylonCommand = {
  (cmd: 'showTicketForm', formSlug: string): void
  (cmd: 'show' | 'hide'): void
  e?: (args: unknown[]) => void
  q?: unknown[][]
}

declare global {
  interface Window {
    pylon?: {
      chat_settings: ChatSettings
    }
    Pylon?: PylonCommand
  }
}

export function useSupportChat() {
  const { user } = useAuth0()

  const { update: updateIntercom, shutdown: shutdownIntercom, showMessages: showIntercomMessenger } = useIntercom()
  const matches = useMatches()

  const service = useMemo(() => {
    return matches.some((match) => match.routeId.startsWith('/_authenticated/onboarding')) ? 'intercom' : 'pylon'
  }, [matches])

  const defaultChatParams = useMemo(() => {
    let defaultChatParams = undefined

    if (!user) return undefined

    if (service === 'pylon') {
      defaultChatParams = {
        app_id: process.env.NX_PUBLIC_PYLON_APP_ID,
        email: user.email,
        name: user.name,
        email_hash: user['https://qovery.com/pylon_hash'],
        avatar_url: user.picture,
      }
    } else {
      defaultChatParams = {
        email: user.email,
        name: user.name,
        userId: user.sub,
        userHash: user['https://qovery.com/intercom_hash'],
      }
    }

    return defaultChatParams
  }, [service, user])

  const initChat = () => {
    if (service === 'pylon') {
      bootstrapPylon(defaultChatParams)
    }
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
    if (service === 'intercom') {
      showIntercomMessenger()
    } else {
      whenPylonReady(() => window.Pylon?.('show'))
    }
  }

  const showPylonForm = (formSlug: string) => {
    whenPylonReady(() => window.Pylon?.('showTicketForm', formSlug))
  }

  const isPylonReady = () => Boolean(window.Pylon && !window.Pylon.q)

  const setPylonChatSettings = (settings?: ChatSettings) => {
    if (!settings) return

    window.pylon = {
      chat_settings: { ...window.pylon?.chat_settings, ...settings },
    }
  }

  const bootstrapPylon = (settings?: ChatSettings) => {
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

  const updateUserInfo = useCallback(
    (settings?: ChatSettings) => {
      if (!settings) return

      if (service === 'pylon') {
        shutdownIntercom()
        setPylonChatSettings({ ...defaultChatParams, ...settings })
      } else {
        window.Pylon?.('hide')
        updateIntercom({ ...defaultChatParams, ...settings })
      }
    },
    [defaultChatParams, service, shutdownIntercom, updateIntercom]
  )

  useEffect(() => {
    if (service === 'pylon') {
      bootstrapPylon(defaultChatParams)
      return
    }

    updateUserInfo(defaultChatParams)
  }, [defaultChatParams, service, updateUserInfo])

  return { updateUserInfo, showChat, initChat, showPylonForm }
}
