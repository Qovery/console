import { AxiosError, AxiosHeaders } from 'axios'
import { EnvironmentCustomDomainApi, OrganizationCustomDomainApi } from 'qovery-typescript-axios'
import { customDomains } from './domains-custom-domains-data-access'

it('sends organization filters, server pagination and cancellation to the generated client', async () => {
  const response = { results: [], total_count: 0, page: 2, page_size: 10 }
  const list = jest.spyOn(OrganizationCustomDomainApi.prototype, 'listOrganizationCustomDomain').mockResolvedValue({
    data: response,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  })
  const signal = new AbortController().signal
  const query = customDomains.organizationList({
    organizationId: 'org',
    projectId: 'project',
    environmentId: 'env',
    search: 'example',
    page: 2,
    pageSize: 10,
  })
  expect(await query.queryFn({ signal } as Parameters<typeof query.queryFn>[0])).toEqual(response)
  expect(list).toHaveBeenCalledWith('org', 'project', 'env', 'example', 2, 10, { signal })
  list.mockRestore()
})

it('returns the environment CNAME target, or null until the environment has a router', async () => {
  const get = jest
    .spyOn(EnvironmentCustomDomainApi.prototype, 'getEnvironmentCustomDomainCnameTarget')
    .mockResolvedValueOnce({
      data: { cname_target: 'z1-gtw.qovery.dev' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: new AxiosHeaders() },
    })
    .mockRejectedValueOnce(
      new AxiosError('Not found', '404', undefined, undefined, {
        data: {},
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: { headers: new AxiosHeaders() },
      })
    )
  const query = customDomains.environmentCnameTarget({ environmentId: 'env' })
  expect(await query.queryFn({} as Parameters<typeof query.queryFn>[0])).toBe('z1-gtw.qovery.dev')
  expect(await query.queryFn({} as Parameters<typeof query.queryFn>[0])).toBeNull()
  expect(get).toHaveBeenCalledWith('env')
  get.mockRestore()
})
