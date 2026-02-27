import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type ServiceStatuses } from '@qovery/shared/interfaces'
import { useServicesList } from '../use-services-list/use-services-list'

type ServiceWithStatus = AnyService & ServiceStatuses

interface ServicesListContextType {
  statuses: Record<string, ServiceStatuses>
  services: ServiceWithStatus[]
  addStatusForService: (serviceId: string, status: ServiceStatuses) => void
}

export function ServicesListProvider({
  children,
  environmentId,
}: {
  children: React.ReactNode
  environmentId: string
}) {
  const [servicesList, setServicesList] = useState<AnyService[]>([])
  const [statuses, setStatuses] = useState<ServicesListContextType['statuses']>({})

  const { data: servicesResponse = [] } = useServicesList({ environmentId, suspense: true })

  useEffect(() => {
    setServicesList(servicesResponse)
  }, [servicesResponse])

  const addStatusForService = useCallback((serviceId: string, status: ServiceStatuses) => {
    setStatuses((prevStatuses) => ({
      ...prevStatuses,
      [serviceId]: {
        ...prevStatuses[serviceId],
        ...status,
      },
    }))
  }, [])

  const services = useMemo((): ServiceWithStatus[] => {
    return servicesList.map((service) => ({
      ...service,
      runningStatus: statuses[service.id]?.runningStatus,
      deploymentStatus: statuses[service.id]?.deploymentStatus,
    }))
  }, [servicesList, statuses])

  const value = useMemo<ServicesListContextType>(
    () => ({
      statuses,
      services,
      addStatusForService,
    }),
    [services, statuses, addStatusForService]
  )

  return <ServicesListContext.Provider value={value}>{children}</ServicesListContext.Provider>
}

export const ServicesListContext = createContext<ServicesListContextType | undefined>(undefined)

export function useServicesListContext() {
  const context = useContext(ServicesListContext)
  if (context === undefined) {
    throw new Error('useServiceLogsContext must be used within a ServicesListProvider')
  }
  return context
}
