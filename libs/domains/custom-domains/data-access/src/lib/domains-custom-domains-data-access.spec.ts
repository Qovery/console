import { AxiosHeaders } from 'axios'
import { OrganizationCustomDomainApi } from 'qovery-typescript-axios'
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
