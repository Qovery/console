// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useLocalStorage } from '@uidotdev/usehooks'
import { type ServiceLightResponse } from 'qovery-typescript-axios'
import { act, renderHook } from '@qovery/shared/util-tests'
import useFavoriteServices from './use-favorite-services'

jest.mock('@uidotdev/usehooks', () => ({
  useLocalStorage: jest.fn(),
}))

type ServiceWithTimestamp = ServiceLightResponse & { timestamp?: number; organizationId?: string }

describe('useFavoriteServices', () => {
  const organizationId = '000'
  let mockLocalStorage: [Record<string, ServiceWithTimestamp[]>, jest.Mock]

  beforeEach(() => {
    const mockSetValue = jest.fn()
    // Initialize with empty object instead of array
    mockLocalStorage = [{}, mockSetValue]
    ;(useLocalStorage as jest.Mock).mockReturnValue(mockLocalStorage)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getFavoriteServices should return favorite services', () => {
    const mockServices: ServiceWithTimestamp[] = [
      { id: '1', name: 'Service 1', organizationId } as ServiceWithTimestamp,
      { id: '2', name: 'Service 2', organizationId } as ServiceWithTimestamp,
    ]

    // Mock storage with organization-specific services
    const mockStorage = {
      [organizationId]: mockServices,
    }

    ;(useLocalStorage as jest.Mock).mockReturnValue([mockStorage, jest.fn()])

    const { result } = renderHook(() => useFavoriteServices({ organizationId }))

    expect(result.current.getFavoriteServices()).toEqual(mockServices)
    expect(useLocalStorage).toHaveBeenCalledWith('qovery-favorite-services', {})
  })

  it('addToFavoriteServices should add a service and respect the limit', () => {
    const existingServices: ServiceWithTimestamp[] = [
      { id: '1', name: 'Service 1', organizationId } as ServiceWithTimestamp,
      { id: '2', name: 'Service 2', organizationId } as ServiceWithTimestamp,
      { id: '3', name: 'Service 3', organizationId } as ServiceWithTimestamp,
      { id: '4', name: 'Service 4', organizationId } as ServiceWithTimestamp,
      { id: '5', name: 'Service 5', organizationId } as ServiceWithTimestamp,
    ]

    // Mock storage with organization-specific services
    const mockStorage = {
      [organizationId]: existingServices,
    }

    const mockSetValue = jest.fn()
    ;(useLocalStorage as jest.Mock).mockReturnValue([mockStorage, mockSetValue])

    const { result } = renderHook(() => useFavoriteServices({ organizationId }))

    const newService: ServiceWithTimestamp = { id: '6', name: 'Service 6' } as ServiceWithTimestamp

    act(() => {
      result.current.addToFavoriteServices(newService)
    })

    // Check that we update the object with the right organization key
    expect(mockSetValue).toHaveBeenCalledWith({
      [organizationId]: [
        // New service should have organizationId added to it
        { ...newService, organizationId },
        existingServices[0],
        existingServices[1],
        existingServices[2],
        existingServices[3],
      ],
    })
  })

  it('toggleFavoriteService should add service when not already favorite', () => {
    const existingServices: ServiceWithTimestamp[] = [
      { id: '1', name: 'Service 1', organizationId } as ServiceWithTimestamp,
    ]

    // Mock storage with organization-specific services
    const mockStorage = {
      [organizationId]: existingServices,
    }

    const mockSetValue = jest.fn()
    ;(useLocalStorage as jest.Mock).mockReturnValue([mockStorage, mockSetValue])

    const { result } = renderHook(() => useFavoriteServices({ organizationId }))

    const newService: ServiceWithTimestamp = { id: '2', name: 'Service 2' } as ServiceWithTimestamp

    let isNowFavorite = false
    act(() => {
      isNowFavorite = result.current.toggleFavoriteService(newService)
    })

    expect(isNowFavorite).toBe(true)
    expect(mockSetValue).toHaveBeenCalledWith({
      [organizationId]: [{ ...newService, organizationId }, existingServices[0]],
    })
  })

  it('toggleFavoriteService should remove service when already favorite', () => {
    const existingServices: ServiceWithTimestamp[] = [
      { id: '1', name: 'Service 1', organizationId } as ServiceWithTimestamp,
      { id: '2', name: 'Service 2', organizationId } as ServiceWithTimestamp,
    ]

    // Mock storage with organization-specific services
    const mockStorage = {
      [organizationId]: existingServices,
    }

    const mockSetValue = jest.fn()
    ;(useLocalStorage as jest.Mock).mockReturnValue([mockStorage, mockSetValue])

    const { result } = renderHook(() => useFavoriteServices({ organizationId }))

    const serviceToToggle: ServiceWithTimestamp = { id: '1', name: 'Service 1' } as ServiceWithTimestamp

    let isNowFavorite = true
    act(() => {
      isNowFavorite = result.current.toggleFavoriteService(serviceToToggle)
    })

    expect(isNowFavorite).toBe(false)
    expect(mockSetValue).toHaveBeenCalledWith({
      [organizationId]: [existingServices[1]],
    })
  })

  it('isServiceFavorite should correctly identify favorite services', () => {
    const existingServices: ServiceWithTimestamp[] = [
      { id: '1', name: 'Service 1', organizationId } as ServiceWithTimestamp,
      { id: '2', name: 'Service 2', organizationId } as ServiceWithTimestamp,
    ]

    // Mock storage with organization-specific services
    const mockStorage = {
      [organizationId]: existingServices,
    }

    ;(useLocalStorage as jest.Mock).mockReturnValue([mockStorage, jest.fn()])

    const { result } = renderHook(() => useFavoriteServices({ organizationId }))

    expect(result.current.isServiceFavorite('1')).toBe(true)
    expect(result.current.isServiceFavorite('2')).toBe(true)
    expect(result.current.isServiceFavorite('3')).toBe(false)
  })

  it('clearFavoriteServices should empty the list for specific organization', () => {
    const existingServices: ServiceWithTimestamp[] = [
      { id: '1', name: 'Service 1', organizationId } as ServiceWithTimestamp,
      { id: '2', name: 'Service 2', organizationId } as ServiceWithTimestamp,
    ]

    // Mock storage with multiple organizations
    const mockStorage = {
      [organizationId]: existingServices,
      'other-org': [{ id: '3', name: 'Service 3', organizationId: 'other-org' }],
    }

    const mockSetValue = jest.fn()
    ;(useLocalStorage as jest.Mock).mockReturnValue([mockStorage, mockSetValue])

    const { result } = renderHook(() => useFavoriteServices({ organizationId }))

    act(() => {
      result.current.clearFavoriteServices()
    })

    // Check that we preserve other organizations but clear the current one
    expect(mockSetValue).toHaveBeenCalledWith({
      [organizationId]: [],
      'other-org': mockStorage['other-org'],
    })
  })
})
