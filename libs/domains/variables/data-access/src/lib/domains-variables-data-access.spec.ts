import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { mutations, variables } from './domains-variables-data-access'

// Exercise the generated SDK serialization without sending a network request.
const adapter = jest.fn<Promise<AxiosResponse<unknown>>, [InternalAxiosRequestConfig]>()
const originalAdapter = axios.defaults.adapter
const selector = String.raw`accounts.0.database\.password`
const savedVariable = { id: 'variable-id', key: 'APP_PASSWORD', value: 'production/config', json_target_key: selector }

describe('external secret API', () => {
  beforeEach(() => {
    adapter.mockImplementation(async (config) => ({
      config,
      status: 200,
      statusText: 'OK',
      headers: {},
      data: config.method === 'get' ? { results: [savedVariable] } : savedVariable,
    }))
    axios.defaults.adapter = adapter
  })

  afterEach(() => {
    axios.defaults.adapter = originalAdapter
  })

  it('serializes the selector on create and edit and retains it on list responses', async () => {
    await mutations.createVariable({
      variableRequest: {
        key: 'APP_PASSWORD',
        value: 'production/config',
        is_secret: false,
        variable_scope: 'APPLICATION',
        variable_parent_id: 'service-id',
        secret_manager_access_id: 'manager-id',
        json_target_key: selector,
      },
    })
    expect(adapter.mock.calls[0][0].method).toBe('post')
    expect(JSON.parse(adapter.mock.calls[0][0].data)).toEqual(
      expect.objectContaining({
        value: 'production/config',
        json_target_key: selector,
      })
    )

    await mutations.editVariable({
      variableId: 'variable-id',
      variableEditRequest: { key: 'APP_PASSWORD', description: 'Updated', json_target_key: selector },
    })
    expect(adapter.mock.calls[1][0].method).toBe('put')
    expect(JSON.parse(adapter.mock.calls[1][0].data)).toEqual(expect.objectContaining({ json_target_key: selector }))

    const query = variables.list({ parentId: 'service-id', scope: 'APPLICATION' })
    const results = await query.queryFn({ queryKey: query.queryKey, meta: undefined })
    expect(results?.[0].json_target_key).toBe(selector)
  })

  it('serializes null when clearing selection and propagates API errors', async () => {
    await mutations.editVariable({
      variableId: 'variable-id',
      variableEditRequest: { key: 'APP_PASSWORD', json_target_key: null },
    })
    expect(JSON.parse(adapter.mock.calls[0][0].data)).toEqual({ key: 'APP_PASSWORD', json_target_key: null })
    adapter.mockRejectedValueOnce(new Error('API unavailable'))
    await expect(mutations.deleteVariable({ variableId: 'variable-id' })).rejects.toThrow('API unavailable')
  })
})
