import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type PropsWithChildren, createContext, useState } from 'react'

export type QuickAction = { label: string; iconName: IconName; link: string }

export const SpotlightContext = createContext<{
  quickActions: QuickAction[]
  setQuickActions: (quickActions: QuickAction[]) => void
}>({
  quickActions: [],
  setQuickActions: () => {},
})

export const SpotlightProvider = ({ children }: PropsWithChildren) => {
  const [quickActions, setQuickActions] = useState<QuickAction[]>([])

  return (
    <SpotlightContext.Provider
      value={{
        quickActions,
        setQuickActions,
      }}
    >
      {children}
    </SpotlightContext.Provider>
  )
}
