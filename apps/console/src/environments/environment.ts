export const environment = {
  api: process.env?.['NX_QOVERY_API'] || '',
  oauth_domain: process.env?.['NX_OAUTH_DOMAIN'] || '',
  oauth_key: process.env?.['NX_OAUTH_KEY'] || '',
  oauth_audience: process.env?.['NX_OAUTH_AUDIENCE'] || '',
}
