import axios, { type AxiosAdapter } from 'axios'

export function createAxiosFetchAdapter(fetch: typeof globalThis.fetch): AxiosAdapter {
  return async (config) => {
    const { Accept: _accept, ...headers } = config.headers.toJSON(true)
    const method = config.method?.toUpperCase()
    const response = await fetch(axios.getUri(config), {
      ...(method !== 'GET' && { method }),
      headers: headers as Record<string, string>,
      ...(config.data !== undefined && { body: config.data }),
    })
    return {
      data: response.status === 204 ? null : await response.json().catch(() => null),
      status: response.status ?? (response.ok ? 200 : 500),
      statusText: response.statusText,
      headers: { 'retry-after': response.headers?.get?.('Retry-After') ?? undefined },
      config,
    }
  }
}
