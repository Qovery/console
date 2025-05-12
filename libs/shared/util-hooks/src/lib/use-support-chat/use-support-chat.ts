import { useCallback } from 'react'

type ChatSettings = {
  app_id?: string
  email?: string
  email_hash?: string
  name?: string
  account_id?: string
  avatar_url?: string
}

declare global {
  interface Window {
    pylon: {
      chat_settings: ChatSettings
    }
    Pylon: (cmd: 'show' | 'hide') => void
  }
}

export function useSupportChat() {
  const updatePylon = useCallback((chatSettings: ChatSettings) => {
    window.pylon = {
      chat_settings: {
        app_id: process.env['NX_PUBLIC_PYLON_APP_ID'],
        ...chatSettings,
      },
    }
  }, [])

  const showChat = () => {
    window.Pylon('show')
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

  return { updatePylon, showChat, insertPylonScriptTag }
}
