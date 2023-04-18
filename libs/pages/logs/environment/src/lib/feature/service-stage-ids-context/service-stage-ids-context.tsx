import { ReactNode, createContext, useContext, useState } from 'react'

interface ServiceStageIdsContextValues {
  serviceId: string
  stageId: string
  updateServiceId: (serviceId: string) => void
  updateStageId: (stageId: string) => void
}

export const ServiceStageIdsContext = createContext<ServiceStageIdsContextValues>({
  serviceId: '',
  stageId: '',
  updateServiceId: () => {},
  updateStageId: () => {},
})

export const ServiceStageIdsProvider = ({ children }: { children: ReactNode }) => {
  const [serviceId, setServiceId] = useState<string>('')
  const [stageId, setStageId] = useState<string>('')

  const updateServiceId = (newServiceId: string) => {
    setServiceId(newServiceId)
  }

  const updateStageId = (newStageId: string) => {
    setStageId(newStageId)
  }

  return (
    <ServiceStageIdsContext.Provider value={{ serviceId, stageId, updateServiceId, updateStageId }}>
      {children}
    </ServiceStageIdsContext.Provider>
  )
}

export const useServiceStageIds = (): ServiceStageIdsContextValues => useContext(ServiceStageIdsContext)
