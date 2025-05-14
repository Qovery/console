import { useAuth0 } from '@auth0/auth0-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMatch, useParams } from 'react-router-dom'
import { type IntercomProps, useIntercom } from 'react-use-intercom'
import { ONBOARDING_URL } from '@qovery/shared/routes'

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
    Pylon?: (cmd: 'show' | 'hide') => void
  }
}

export function useSupportChat() {
  const { user } = useAuth0()
  const { organizationId } = useParams()

  const { update: updateIntercom, shutdown: shutdownIntercom, showMessages: showIntercomMessenger } = useIntercom()
  const matchesOnboardingRoutes = useMatch({ path: ONBOARDING_URL, end: false })

  const service = useMemo(() => {
    return matchesOnboardingRoutes ? 'intercom' : 'pylon'
  }, [matchesOnboardingRoutes])

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

  const [chatSettings, setChatSettings] = useState<ChatSettings | undefined>(defaultChatParams)

  const initChat = () => {
    if (service === 'pylon') {
      insertPylonScriptTag()
    }
  }

  const updateUserInfo = (params: ChatSettings) => {
    setChatSettings((state) => ({ ...state, ...params }))
  }

  const showChat = () => {
    if (service === 'intercom') {
      showIntercomMessenger()
    } else {
      window.Pylon?.('show')
    }
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

  const applyChatSettings = useCallback(() => {
    if (!chatSettings) return

    if (service === 'pylon') {
      shutdownIntercom()
      window.pylon = {
        chat_settings: chatSettings,
      }
    } else {
      window.Pylon?.('hide')
      updateIntercom(chatSettings)
    }
  }, [chatSettings, service, updateIntercom, shutdownIntercom])

  // When chat settings change, refresh the service with the up-to-date information
  useEffect(() => {
    if (!chatSettings) return

    applyChatSettings()
  }, [chatSettings, applyChatSettings])

  return { updateUserInfo, showChat, initChat }
}
