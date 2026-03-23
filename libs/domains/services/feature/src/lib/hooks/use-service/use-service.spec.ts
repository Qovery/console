import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'
import { useServiceType } from '../use-service-type/use-service-type'
import { useService } from './use-service'

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

jest.mock('../use-service-type/use-service-type', () => ({
  ...jest.requireActual('../use-service-type/use-service-type'),
  useServiceType: jest.fn(),
}))

describe('useService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useQuery as jest.Mock).mockReturnValue({})
  })

  it('should use explicit serviceType when provided', () => {
    ;(useServiceType as jest.Mock).mockReturnValue({ data: undefined })

    useService({ serviceId: 'service-1', serviceType: 'APPLICATION' })

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queries.services.details({ serviceId: 'service-1', serviceType: 'APPLICATION' }).queryKey,
        enabled: true,
      })
    )
  })

  it('should use fetched serviceType when not provided', () => {
    ;(useServiceType as jest.Mock).mockReturnValue({ data: 'DATABASE' })

    useService({ environmentId: 'environment-1', serviceId: 'service-1' })

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queries.services.details({ serviceId: 'service-1', serviceType: 'DATABASE' }).queryKey,
        enabled: true,
      })
    )
  })

  it('should keep details query disabled until serviceType is known', () => {
    ;(useServiceType as jest.Mock).mockReturnValue({ data: undefined })

    useService({ environmentId: 'environment-1', serviceId: 'service-1', suspense: true })

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['services', 'details', 'service-1'],
        enabled: false,
        suspense: false,
      })
    )
  })
})
