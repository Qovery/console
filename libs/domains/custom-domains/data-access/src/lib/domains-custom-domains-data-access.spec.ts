import { AxiosError, AxiosHeaders } from 'axios'
import { EnvironmentCustomDomainApi, OrganizationCustomDomainApi } from 'qovery-typescript-axios'
import { customDomains, mutations } from './domains-custom-domains-data-access'

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
    // The console's HTTP interceptor rejects with `{ message, response }` instead of an AxiosError.
    .mockRejectedValueOnce({ message: 'Not found', response: { status: 404 } })
  const query = customDomains.environmentCnameTarget({ environmentId: 'env' })
  expect(await query.queryFn({} as Parameters<typeof query.queryFn>[0])).toBe('z1-gtw.qovery.dev')
  expect(await query.queryFn({} as Parameters<typeof query.queryFn>[0])).toBeNull()
  expect(await query.queryFn({} as Parameters<typeof query.queryFn>[0])).toBeNull()
  expect(get).toHaveBeenCalledWith('env')
  get.mockRestore()
})

it('edits, deletes and bulk deletes domains through the environment and organization endpoints', async () => {
  const ok = <T>(data: T) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  })
  const impacted = { impacted_services: [{ id: 'web', type: 'APPLICATION' as const }] }
  const payload = { domain: 'www.example.com', services: [{ id: 'web', type: 'APPLICATION' as const }] }
  const edit = jest
    .spyOn(EnvironmentCustomDomainApi.prototype, 'editEnvironmentCustomDomain')
    .mockResolvedValue(ok({ ...impacted, domain: 'www.example.com', generate_certificate: true, use_cdn: false }))
  const remove = jest
    .spyOn(EnvironmentCustomDomainApi.prototype, 'deleteEnvironmentCustomDomain')
    .mockResolvedValue(ok(impacted))
  const bulkDelete = jest
    .spyOn(OrganizationCustomDomainApi.prototype, 'bulkDeleteOrganizationCustomDomain')
    .mockResolvedValue(ok(impacted))

  await mutations.editEnvironmentCustomDomain({ environmentId: 'env', domainName: 'app.example.com', payload })
  expect(edit).toHaveBeenCalledWith('env', 'app.example.com', payload)
  expect(
    await mutations.deleteEnvironmentCustomDomain({ environmentId: 'env', domainName: 'app.example.com' })
  ).toEqual(impacted)
  expect(remove).toHaveBeenCalledWith('env', 'app.example.com')
  const domains = [{ environment_id: 'env', domain: 'app.example.com' }]
  await mutations.bulkDeleteOrganizationCustomDomain({ organizationId: 'org', domains })
  expect(bulkDelete).toHaveBeenCalledWith('org', domains)
  jest.restoreAllMocks()
})
