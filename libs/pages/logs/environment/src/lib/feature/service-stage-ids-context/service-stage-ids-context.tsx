import { ReactNode, createContext, useContext, useState } from 'react'

interface ServiceStageIdsContextValues {
  serviceId: string
  stageId: string
  versionId: string
  updateServiceId: (serviceId: string) => void
  updateStageId: (stageId: string) => void
  updateVersionId: (versionId: string) => void
}

export const ServiceStageIdsContext = createContext<ServiceStageIdsContextValues>({
  serviceId: '',
  stageId: '',
  versionId: '',
  updateServiceId: () => {},
  updateStageId: () => {},
  updateVersionId: () => {},
})

export const ServiceStageIdsProvider = ({ children }: { children: ReactNode }) => {
  const [serviceId, setServiceId] = useState<string>('')
  const [stageId, setStageId] = useState<string>('')
  const [versionId, setVersionId] = useState<string>('')

  const updateServiceId = (newServiceId: string) => {
    setServiceId(newServiceId)
  }

  const updateStageId = (newStageId: string) => {
    setStageId(newStageId)
  }

  const updateVersionId = (newVersionId: string) => {
    setVersionId(newVersionId)
  }

  return (
    <ServiceStageIdsContext.Provider
      value={{ serviceId, stageId, versionId, updateServiceId, updateStageId, updateVersionId }}
    >
      {children}
    </ServiceStageIdsContext.Provider>
  )
}

export const useServiceStageIds = (): ServiceStageIdsContextValues => useContext(ServiceStageIdsContext)
