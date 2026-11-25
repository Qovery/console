import { AxiosError, AxiosHeaders } from 'axios'
import { mutations } from '@qovery/domains/services/data-access'
import {
  deleteOrganizationCustomDomainCopy,
  settleOrganizationCustomDomainOperations,
} from './organization-custom-domain-operations'

jest.mock('@qovery/domains/services/data-access', () => ({
  ...jest.requireActual('@qovery/domains/services/data-access'),
  mutations: { deleteCustomDomain: jest.fn() },
}))

const target = { serviceId: 'web', serviceType: 'APPLICATION' as const, customDomainId: 'domain-web' }
const apiError = (status: number, data: object = {}) =>
  new AxiosError('Request failed', String(status), undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  })
const describeFailure = (failed: number, total: number) => `${failed} of ${total} failed.`

describe('settleOrganizationCustomDomainOperations', () => {
  it('resolves when every operation succeeds', async () => {
    await expect(
      settleOrganizationCustomDomainOperations([() => Promise.resolve(), () => Promise.resolve()], describeFailure)
    ).resolves.toBeUndefined()
  })

  it('runs every operation and reports how many failed with the first API reason', async () => {
    const succeeding = jest.fn().mockResolvedValue(undefined)
    await expect(
      settleOrganizationCustomDomainOperations(
        [
          () => Promise.reject(apiError(409, { message: 'Domain already used.' })),
          succeeding,
          () => Promise.reject(new Error('boom')),
        ],
        describeFailure
      )
    ).rejects.toThrow('2 of 3 failed. Domain already used.')
    expect(succeeding).toHaveBeenCalled()
  })
})

describe('deleteOrganizationCustomDomainCopy', () => {
  it('treats a copy that is already gone as deleted', async () => {
    jest.mocked(mutations.deleteCustomDomain).mockRejectedValue(apiError(404))
    await expect(deleteOrganizationCustomDomainCopy(target)).resolves.toBeUndefined()
    expect(mutations.deleteCustomDomain).toHaveBeenCalledWith(target)
  })

  it('rethrows other errors', async () => {
    jest.mocked(mutations.deleteCustomDomain).mockRejectedValue(apiError(500))
    await expect(deleteOrganizationCustomDomainCopy(target)).rejects.toThrow('Request failed')
  })
})
