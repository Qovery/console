const { NX_QOVERY_API = '', NX_OAUTH_DOMAIN = '', NX_OAUTH_KEY = '', NX_OAUTH_AUDIENCE = '' } = process.env

export const environment = {
  production: true,
  api: NX_QOVERY_API,
  oauth_domain: NX_OAUTH_DOMAIN,
  oauth_key: NX_OAUTH_KEY,
  oauth_audience: NX_OAUTH_AUDIENCE,
}
