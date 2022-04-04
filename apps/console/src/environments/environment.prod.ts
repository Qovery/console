export const environment = {
  production: process.env?.['NODE_ENV'] || '',
  api: process.env?.['NX_QOVERY_API'] || '',
  oauth_domain: process.env?.['NX_OAUTH_DOMAIN'] || '',
  oauth_key: process.env?.['NX_OAUTH_KEY'] || '',
  oauth_audience: process.env?.['NX_OAUTH_AUDIENCE'] || '',
  intercom: process.env?.['NX_INTERCOM'] || '',
  posthog: process.env?.['NX_POSTHOG'] || '',
  posthog_apihost: process.env?.['NX_POSTHOG_APIHOST'] || '',
  logrocket: process.env?.['NX_LOGROCKET'] || '',
  gtm: process.env?.['NX_GTM'] || '',
}
