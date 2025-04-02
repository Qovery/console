// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useLocalStorage } from '@uidotdev/usehooks'
import { type ServiceLightResponse } from 'qovery-typescript-axios'

const MAX_RECENT_SERVICES = 5

interface StoredService extends ServiceLightResponse {
  timestamp: number
  organizationId: string
}

interface RecentServicesStorage {
  [organizationId: string]: StoredService[]
}

/**
 * Custom hook to manage recent services by organizationId
 * @param organizationId - ID of the current organization
 * @returns Functions to interact with recent services
 */
export const useRecentServices = ({ organizationId }: { organizationId: string }) => {
  const [recentServicesStorage, setRecentServicesStorage] = useLocalStorage<RecentServicesStorage>(
    'qovery-recent-services',
    {}
  )

  const getRecentServices = (): ServiceLightResponse[] => {
    return recentServicesStorage[organizationId] || []
  }

  const addToRecentServices = (service: ServiceLightResponse): void => {
    const orgRecents = recentServicesStorage[organizationId] || []
    const serviceWithMetadata = {
      ...service,
      timestamp: Date.now(),
      organizationId,
    }

    const filteredOrgRecents = orgRecents.filter((s) => s.id !== service.id)
    const updatedOrgRecents = [serviceWithMetadata, ...filteredOrgRecents].slice(0, MAX_RECENT_SERVICES)

    setRecentServicesStorage({
      ...recentServicesStorage,
      [organizationId]: updatedOrgRecents,
    })
  }

  const removeFromRecentServices = (serviceId: string): void => {
    const orgRecents = recentServicesStorage[organizationId] || []
    const updatedOrgRecents = orgRecents.filter((service) => service.id !== serviceId)

    setRecentServicesStorage({
      ...recentServicesStorage,
      [organizationId]: updatedOrgRecents,
    })
  }

  const clearRecentServices = (): void => {
    setRecentServicesStorage({
      ...recentServicesStorage,
      [organizationId]: [],
    })
  }

  return {
    getRecentServices,
    addToRecentServices,
    removeFromRecentServices,
    clearRecentServices,
  }
}

export default useRecentServices
