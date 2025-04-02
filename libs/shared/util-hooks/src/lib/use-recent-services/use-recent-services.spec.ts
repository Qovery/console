// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useLocalStorage } from '@uidotdev/usehooks'
import { type ServiceLightResponse } from 'qovery-typescript-axios'
import { act, renderHook } from '@qovery/shared/util-tests'
import useRecentServices from './use-recent-services'

jest.mock('@uidotdev/usehooks', () => ({
  useLocalStorage: jest.fn(),
}))

type ServiceWithTimestamp = ServiceLightResponse & { timestamp?: number; organizationId?: string }

describe('useRecentServices', () => {
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

  it('getRecentServices should return recent services', () => {
    const mockServices: ServiceWithTimestamp[] = [
      { id: '1', name: 'Service 1', timestamp: 100, organizationId } as ServiceWithTimestamp,
      { id: '2', name: 'Service 2', timestamp: 90, organizationId } as ServiceWithTimestamp,
    ]

    // Mock storage with organization-specific services
    const mockStorage = {
      [organizationId]: mockServices,
    }

    ;(useLocalStorage as jest.Mock).mockReturnValue([mockStorage, jest.fn()])

    const { result } = renderHook(() => useRecentServices({ organizationId }))

    expect(result.current.getRecentServices()).toEqual(mockServices)
    expect(useLocalStorage).toHaveBeenCalledWith('qovery-recent-services', {})
  })

  it('addToRecentServices should add a service with timestamp and respect the limit', () => {
    const existingServices: ServiceWithTimestamp[] = [
      { id: '1', name: 'Service 1', timestamp: 500, organizationId } as ServiceWithTimestamp,
      { id: '2', name: 'Service 2', timestamp: 400, organizationId } as ServiceWithTimestamp,
      { id: '3', name: 'Service 3', timestamp: 300, organizationId } as ServiceWithTimestamp,
      { id: '4', name: 'Service 4', timestamp: 200, organizationId } as ServiceWithTimestamp,
      { id: '5', name: 'Service 5', timestamp: 100, organizationId } as ServiceWithTimestamp,
    ]

    // Mock storage with organization-specific services
    const mockStorage = {
      [organizationId]: existingServices,
    }

    const mockSetValue = jest.fn()
    ;(useLocalStorage as jest.Mock).mockReturnValue([mockStorage, mockSetValue])

    const { result } = renderHook(() => useRecentServices({ organizationId }))

    const mockTimestamp = 1675209600000 // Feb 1, 2023 timestamp
    jest.spyOn(Date, 'now').mockImplementation(() => mockTimestamp)

    const newService: ServiceWithTimestamp = { id: '6', name: 'Service 6' } as ServiceWithTimestamp

    act(() => {
      result.current.addToRecentServices(newService)
    })

    // Check that we update the object with the right organization key
    expect(mockSetValue).toHaveBeenCalledWith({
      [organizationId]: [
        // New service should have timestamp and organizationId added to it
        { ...newService, timestamp: mockTimestamp, organizationId },
        existingServices[0],
        existingServices[1],
        existingServices[2],
        existingServices[3],
      ],
    })

    jest.spyOn(Date, 'now').mockRestore()
  })

  it('removeFromRecentServices should remove a service by its ID', () => {
    const existingServices: ServiceWithTimestamp[] = [
      { id: '1', name: 'Service 1', timestamp: 100, organizationId } as ServiceWithTimestamp,
      { id: '2', name: 'Service 2', timestamp: 90, organizationId } as ServiceWithTimestamp,
    ]

    // Mock storage with organization-specific services
    const mockStorage = {
      [organizationId]: existingServices,
    }

    const mockSetValue = jest.fn()
    ;(useLocalStorage as jest.Mock).mockReturnValue([mockStorage, mockSetValue])

    const { result } = renderHook(() => useRecentServices({ organizationId }))

    act(() => {
      result.current.removeFromRecentServices('1')
    })

    expect(mockSetValue).toHaveBeenCalledWith({
      [organizationId]: [existingServices[1]],
    })
  })

  it('clearRecentServices should empty the list for specific organization', () => {
    const existingServices: ServiceWithTimestamp[] = [
      { id: '1', name: 'Service 1', timestamp: 100, organizationId } as ServiceWithTimestamp,
      { id: '2', name: 'Service 2', timestamp: 90, organizationId } as ServiceWithTimestamp,
    ]

    // Mock storage with multiple organizations
    const mockStorage = {
      [organizationId]: existingServices,
      'other-org': [{ id: '3', name: 'Service 3', timestamp: 80, organizationId: 'other-org' }],
    }

    const mockSetValue = jest.fn()
    ;(useLocalStorage as jest.Mock).mockReturnValue([mockStorage, mockSetValue])

    const { result } = renderHook(() => useRecentServices({ organizationId }))

    act(() => {
      result.current.clearRecentServices()
    })

    // Check that we preserve other organizations but clear the current one
    expect(mockSetValue).toHaveBeenCalledWith({
      [organizationId]: [],
      'other-org': mockStorage['other-org'],
    })
  })
})
