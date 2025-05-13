import { useAuth0 } from '@auth0/auth0-react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
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
    Pylon?: (cmd: 'show' | 'hide') => void
  }
}

export function useSupportChat() {
  const { user } = useAuth0()
  const { pathname } = useLocation()
  const { organizationId } = useParams()
  const { update: updateIntercom, hardShutdown: shutdownIntercom, showMessages: showIntercomMessenger } = useIntercom()
  const [currentService, setCurrentService] = useState<'intercom' | 'pylon' | undefined>(undefined)

  const updatePylon = useCallback((chatSettings: ChatSettings) => {
    window.pylon = {
      chat_settings: {
        app_id: process.env['NX_PUBLIC_PYLON_APP_ID'],
        ...chatSettings,
      },
    }
  }, [])

  const updateUserInfo = (params: ChatSettings) => {
    if (currentService === 'pylon') {
      updatePylon(params)
    } else {
      updateIntercom(params)
    }
  }

  const initIntercom = useCallback(() => {
    if (!user || currentService === 'intercom') return

    window.Pylon?.('hide')
    updateIntercom({
      email: user.email,
      name: user.name,
      userId: user.sub,
      userHash: user['https://qovery.com/intercom_hash'],
    })
    setCurrentService('intercom')
  }, [user, updateIntercom, setCurrentService, currentService])

  const initPylon = useCallback(() => {
    if (!user || currentService === 'pylon') return

    shutdownIntercom()
    updatePylon({
      email: user.email,
      name: user.name,
      account_id: user.sub,
      email_hash: user['https://qovery.com/pylon_hash'],
      avatar_url: user.picture,
      account_external_id: organizationId,
    })
    setCurrentService('pylon')
  }, [user, organizationId, updatePylon, setCurrentService, shutdownIntercom, currentService])

  const initChat = useCallback(() => {
    const isOnboarding = pathname.includes('onboarding')

    if (isOnboarding) {
      initIntercom()
    } else {
      insertPylonScriptTag()
      initPylon()
    }
  }, [pathname, initPylon, initIntercom])

  useEffect(() => {
    initChat()
  }, [pathname, initChat])

  const showChat = () => {
    if (currentService === 'intercom') {
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
    tag.setAttribute('src', `https://widget.usepylon.com/widget/${process.env['NX_PUBLIC_PYLON_APP_ID']}`)

    const mainScriptTag = document.getElementsByTagName('script')[0]

    mainScriptTag.parentNode?.insertBefore(tag, mainScriptTag)
  }

  return { updateUserInfo, showChat, initChat }
}
