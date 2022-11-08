import { useEffect } from 'react'

export interface DarkModeEnablerProps {
  isDarkMode?: boolean
  children: JSX.Element
}

export function DarkModeEnabler(props: DarkModeEnablerProps) {
  const { isDarkMode = false, children } = props

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark')

    return () => {
      if (isDarkMode) document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return children
}

export default DarkModeEnabler
