import { type PropsWithChildren, createContext, useContext, useState } from 'react'

interface Location {
  pathname: string
}

interface MyHistoryContextType {
  myHistory: Location[]
  push: (location: Location) => void
}

const MyHistoryContext = createContext<MyHistoryContextType | undefined>(undefined)

const MyHistoryProvider = ({ children }: PropsWithChildren) => {
  const [myHistory, setMyHistory] = useState<Location[]>([])

  const push = (location: Location) => setMyHistory([...myHistory, location])

  return <MyHistoryContext.Provider value={{ myHistory, push }}>{children}</MyHistoryContext.Provider>
}

const useMyHistory = (): MyHistoryContextType => {
  const context = useContext(MyHistoryContext)
  if (context === undefined) {
    throw new Error('useMyHistory must be used within a MyHistoryProvider')
  }
  return context
}

export { MyHistoryProvider, useMyHistory }
