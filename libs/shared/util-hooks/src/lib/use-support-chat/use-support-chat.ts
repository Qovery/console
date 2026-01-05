import { useAuth0 } from '@auth0/auth0-react'
import { useMatches, useParams } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo } from 'react'
import { type IntercomProps, useIntercom } from 'react-use-intercom'

type IntercomChatSettings = Partial<IntercomProps>

type PylonChatSettings = {
  app_id?: string
  email?: string
  email_hash?: string
  name?: string
  account_id?: string
  avatar_url?: string
  account_external_id?: string
}

type ChatSettings = IntercomChatSettings | PylonChatSettings

declare global {
  interface Window {
    pylon?: {
      chat_settings: ChatSettings
    }
    Pylon?: {
      (cmd: 'showTicketForm', formSlug: string): void
      (cmd: 'show' | 'hide'): void
    }
  }
}

export function useSupportChat() {
  const { user } = useAuth0()
  const { organizationId } = useParams({ strict: false })

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
        account_id: user.sub,
        email_hash: user['https://qovery.com/pylon_hash'],
        avatar_url: user.picture,
        account_external_id: organizationId,
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
  }, [service, user, organizationId])

  const initChat = () => {
    if (service === 'pylon') {
      insertPylonScriptTag()
    }
  }

  const showChat = () => {
    if (service === 'intercom') {
      showIntercomMessenger()
    } else {
      window.Pylon?.('show')
    }
  }

  const showPylonForm = (formSlug: string) => {
    window.Pylon?.('showTicketForm', formSlug)
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
        window.pylon = {
          chat_settings: { ...defaultChatParams, ...settings },
        }
      } else {
        window.Pylon?.('hide')
        updateIntercom({ ...defaultChatParams, ...settings })
      }
    },
    [defaultChatParams, service, shutdownIntercom, updateIntercom]
  )

  useEffect(() => {
    updateUserInfo(defaultChatParams)
  }, [defaultChatParams, updateUserInfo])

  return { updateUserInfo, showChat, initChat, showPylonForm }
}
