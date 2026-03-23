import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'
import { useCloneService } from './use-clone-service'

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}))

describe('useCloneService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should hydrate clone caches on success', () => {
    const setQueryData = jest.fn()
    const invalidateQueries = jest.fn()
    ;(useQueryClient as jest.Mock).mockReturnValue({
      setQueryData,
      invalidateQueries,
    })
    ;(useMutation as jest.Mock).mockImplementation((_mutation, options) => options)

    const cloneMutation = useCloneService()
    const result = {
      id: 'service-2',
      service_type: 'APPLICATION',
      environment: {
        id: 'environment-1',
      },
    }

    cloneMutation.onSuccess(result)

    expect(useMutation).toHaveBeenCalledWith(
      mutations.cloneService,
      expect.objectContaining({
        meta: expect.objectContaining({
          notifyOnSuccess: { title: 'Your service is cloned' },
        }),
      })
    )
    expect(setQueryData).toHaveBeenNthCalledWith(
      1,
      queries.services.details({ serviceId: 'service-2', serviceType: 'APPLICATION' }).queryKey,
      expect.objectContaining({
        id: 'service-2',
        serviceType: 'APPLICATION',
        service_type: 'APPLICATION',
      })
    )
    expect(setQueryData).toHaveBeenNthCalledWith(
      2,
      queries.services.list('environment-1').queryKey,
      expect.any(Function)
    )

    const updater = setQueryData.mock.calls[1][1]
    expect(updater([{ id: 'service-1' }])).toEqual([
      { id: 'service-1' },
      expect.objectContaining({
        id: 'service-2',
        serviceType: 'APPLICATION',
      }),
    ])

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queries.services.list('environment-1').queryKey,
    })
  })
})
