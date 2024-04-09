import { useEffect, useState } from 'react'

export function useFormatHotkeys(hotkeys: string): string {
  const [isMacOS, setIsMacOS] = useState(false)
  useEffect(() => {
    setIsMacOS(window.navigator.userAgent.includes('Mac OS'))
  }, [])

  const hotkeysFormat = hotkeys.split('+').map((hotkey) => {
    switch (hotkey) {
      case 'meta':
        return isMacOS ? '⌘' : 'Ctrl'
      case 'ctrl':
        return 'Ctrl'
      case 'shift':
        return '⇧'
      case 'alt':
        return isMacOS ? '⌥' : 'Alt'
      case 'enter':
        return '⏎'
      default:
        return hotkey.toUpperCase()
    }
  })
  return hotkeysFormat.join(' + ')
}
