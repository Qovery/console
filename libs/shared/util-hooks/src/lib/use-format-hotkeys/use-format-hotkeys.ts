import { useEffect, useState } from 'react'

export function useFormatHotkeys(hotkeys: string): string | undefined {
  const [isMacOS, setIsMacOS] = useState<boolean | null>(null)
  useEffect(() => {
    setIsMacOS(window.navigator.userAgent.includes('Mac OS'))
  }, [])

  // Avoid glitch on macOS if not set in useEffect
  if (isMacOS === null) return undefined

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
