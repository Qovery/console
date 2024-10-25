import { useEffect } from 'react'

export interface DarkModeEnablerProps {
  isDarkMode?: boolean
  children: JSX.Element
}

export function DarkModeEnabler(props: DarkModeEnablerProps) {
  const { isDarkMode = false, children } = props

  const hideElementTransitionDuringNavigation = () => {
    const css = document.createElement('style')
    css.appendChild(
      document.createTextNode(
        `* {
          -webkit-transition: none !important;
          -moz-transition: none !important;
          -o-transition: none !important;
          -ms-transition: none !important;
          transition: none !important;
        }`
      )
    )
    document.head.appendChild(css)
    setTimeout(() => document.head.removeChild(css), 1000)
  }

  useEffect(() => {
    // Handle meta tag for color scheme
    let metaColorScheme = document.querySelector('meta[name="color-scheme"]')
    if (!metaColorScheme) {
      metaColorScheme = document.createElement('meta')
      metaColorScheme.setAttribute('name', 'color-scheme')
      document.head.appendChild(metaColorScheme)
    }
    metaColorScheme.setAttribute('content', isDarkMode ? 'dark' : 'light')

    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      hideElementTransitionDuringNavigation()
    }

    return () => {
      if (isDarkMode) {
        document.documentElement.classList.remove('dark')
        hideElementTransitionDuringNavigation()
      }
    }
  }, [isDarkMode])

  return children
}

export default DarkModeEnabler
