// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useLocalStorage } from '@uidotdev/usehooks'
import { type ServiceLightResponse } from 'qovery-typescript-axios'

const MAX_FAVORITE_SERVICES = 5

interface StoredService extends ServiceLightResponse {
  organizationId: string
}

interface FavoriteServicesStorage {
  [organizationId: string]: StoredService[]
}

/**
 * Custom hook to manage favorite services by organizationId
 * @param organizationId - ID of the current organization
 * @returns Functions to interact with favorite services
 */
export const useFavoriteServices = ({ organizationId }: { organizationId: string }) => {
  const [favoriteServicesStorage, setFavoriteServicesStorage] = useLocalStorage<FavoriteServicesStorage>(
    'qovery-favorite-services',
    {}
  )

  const getFavoriteServices = (): ServiceLightResponse[] => {
    return favoriteServicesStorage[organizationId] || []
  }

  const addToFavoriteServices = (service: ServiceLightResponse): void => {
    const orgFavorites = favoriteServicesStorage[organizationId] || []
    const isAlreadyFavorite = orgFavorites.some((fav) => fav.id === service.id)

    if (isAlreadyFavorite) return

    const serviceWithOrg = { ...service, organizationId }
    const updatedOrgFavorites = [serviceWithOrg, ...orgFavorites].slice(0, MAX_FAVORITE_SERVICES)

    setFavoriteServicesStorage({
      ...favoriteServicesStorage,
      [organizationId]: updatedOrgFavorites,
    })
  }

  const removeFromFavoriteServices = (serviceId: string): void => {
    const orgFavorites = favoriteServicesStorage[organizationId] || []
    const updatedOrgFavorites = orgFavorites.filter((service) => service.id !== serviceId)

    setFavoriteServicesStorage({
      ...favoriteServicesStorage,
      [organizationId]: updatedOrgFavorites,
    })
  }

  const toggleFavoriteService = (service: ServiceLightResponse): boolean => {
    const orgFavorites = favoriteServicesStorage[organizationId] || []
    const isAlreadyFavorite = orgFavorites.some((fav) => fav.id === service.id)

    if (isAlreadyFavorite) {
      removeFromFavoriteServices(service.id)
      return false
    } else {
      addToFavoriteServices(service)
      return true
    }
  }

  const isServiceFavorite = (serviceId: string): boolean => {
    const orgFavorites = favoriteServicesStorage[organizationId] || []
    return orgFavorites.some((fav) => fav.id === serviceId)
  }

  const clearFavoriteServices = (): void => {
    setFavoriteServicesStorage({
      ...favoriteServicesStorage,
      [organizationId]: [],
    })
  }

  return {
    getFavoriteServices,
    addToFavoriteServices,
    removeFromFavoriteServices,
    toggleFavoriteService,
    isServiceFavorite,
    clearFavoriteServices,
  }
}

export default useFavoriteServices
