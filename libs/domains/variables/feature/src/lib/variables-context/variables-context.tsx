import { type PropsWithChildren, createContext, useState } from 'react'

export const VariablesContext = createContext<{
  showAllVariablesValues: boolean
  setShowAllVariablesValues: (b: boolean) => void
}>({
  showAllVariablesValues: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setShowAllVariablesValues: (b: boolean) => {},
})

export function VariablesProvider({ children }: PropsWithChildren) {
  const [showAllVariablesValues, setShowAllVariablesValues] = useState(false)

  return (
    <VariablesContext.Provider value={{ showAllVariablesValues, setShowAllVariablesValues }}>
      {children}
    </VariablesContext.Provider>
  )
}
