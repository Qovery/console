import { type QueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import { describeServiceCount, redeployCustomDomainServices } from './impacted-services'

jest.mock('@qovery/shared/ui', () => ({ toast: jest.fn() }))

const queryClient = { invalidateQueries: jest.fn() } as unknown as QueryClient
const services = [
  { id: 'web', type: 'APPLICATION' as const },
  { id: 'api', type: 'CONTAINER' as const },
  { id: 'db', type: 'DATABASE' as const },
]

beforeEach(() => jest.clearAllMocks())
afterEach(() => jest.restoreAllMocks())

it('only counts services that can have custom domains', () => {
  expect(describeServiceCount(services)).toBe('2 services')
  expect(describeServiceCount([services[0]])).toBe('1 service')
})

it('redeploys the custom domain services and announces it when asked', async () => {
  const deploy = jest.spyOn(mutations, 'deployService').mockResolvedValue({} as never)
  await redeployCustomDomainServices(queryClient, services, { announce: true })
  expect(deploy).toHaveBeenCalledTimes(2)
  expect(deploy).toHaveBeenCalledWith({ serviceId: 'web', serviceType: 'APPLICATION' })
  expect(deploy).toHaveBeenCalledWith({ serviceId: 'api', serviceType: 'CONTAINER' })
  expect(toast).toHaveBeenCalledWith('success', 'Redeploying 2 services')
})

it('reports failed redeploys without rejecting and retries only those', async () => {
  const deploy = jest
    .spyOn(mutations, 'deployService')
    .mockResolvedValueOnce({} as never)
    // The console's HTTP interceptor rejects with `{ message }` objects.
    .mockRejectedValueOnce({ message: 'A deployment is already running.' })
    .mockResolvedValueOnce({} as never)
  await expect(redeployCustomDomainServices(queryClient, services)).resolves.toBeUndefined()
  expect(toast).toHaveBeenCalledWith(
    'error',
    '1 of 2 services could not be redeployed',
    'A deployment is already running.',
    expect.any(Function),
    'Retry'
  )
  const retry = jest.mocked(toast).mock.calls[0][3] as () => Promise<void>
  await retry()
  expect(deploy).toHaveBeenLastCalledWith({ serviceId: 'api', serviceType: 'CONTAINER' })
  expect(toast).toHaveBeenLastCalledWith('success', 'Redeploying 1 service')
})
