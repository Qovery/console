import axios, { type AxiosAdapter, type AxiosResponse } from 'axios'
import { BillingApi, Configuration } from 'qovery-pricing-typescript-axios'

export class BillingError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public field?: string,
    public retryAfter?: number
  ) {
    super(message)
  }
}

interface BillingTransportOptions {
  pricingApiUrl: string
  getToken?: () => Promise<string> | string
  fetch?: typeof fetch
}

export function createPricingFetchAdapter(fetch: typeof globalThis.fetch): AxiosAdapter {
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

export function createBillingApi({ pricingApiUrl, getToken, fetch }: BillingTransportOptions) {
  const basePath = pricingApiUrl.replace(/\/$/, '')
  const transport = axios.create({
    baseURL: basePath,
    validateStatus: () => true,
    ...(fetch && { adapter: createPricingFetchAdapter(fetch) }),
  })
  const configuration = new Configuration({ basePath, accessToken: getToken ? async () => getToken() : undefined })
  return new BillingApi(configuration, basePath, transport)
}

export async function billingData<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
  const { status, statusText, data, headers } = await request
  if (status >= 200 && status < 300) return data

  const body = data as { code?: string; detail?: string; field?: string } | null
  const retry = Number(headers['retry-after'])
  throw new BillingError(
    status,
    body?.code ?? 'ERROR',
    body?.detail ?? statusText,
    body?.field,
    Number.isFinite(retry) && retry > 0 ? retry : undefined
  )
}
