import { type ReactNode, createContext, useContext, useState } from 'react'

interface ServiceStageIdsContextValues {
  stageId: string
  updateStageId: (stageId: string) => void
}
export const ServiceStageIdsContext = createContext<ServiceStageIdsContextValues>({
  stageId: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateStageId: () => {},
})

export const ServiceStageIdsProvider = ({ children }: { children: ReactNode }) => {
  const [stageId, setStageId] = useState<string>('')

  const updateStageId = (newStageId: string) => {
    setStageId(newStageId)
  }

  return (
    <ServiceStageIdsContext.Provider value={{ stageId, updateStageId }}>{children}</ServiceStageIdsContext.Provider>
  )
}

export const useServiceStageIds = (): ServiceStageIdsContextValues => useContext(ServiceStageIdsContext)
