declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string
      NX_GIT_SHA: string
      NX_QOVERY_API: string
      NX_QOVERY_WS: string
      NX_OAUTH_DOMAIN: string
      NX_OAUTH_KEY: string
      NX_OAUTH_AUDIENCE: string
      NX_INTERCOM: string
      NX_POSTHOG: string
      NX_POSTHOG_APIHOST: string
      NX_LOGROCKET: string
      NX_GTM: string
      NX_INSTATUS_APP_ID: string
      NX_ALGOLIA_APP_ID: string
      NX_ALGOLIA_API_KEY: string
    }
  }
}

export const NODE_ENV = process.env.NODE_ENV,
  NX_GIT_SHA = process.env.NX_GIT_SHA,
  QOVERY_API = process.env.NX_QOVERY_API,
  QOVERY_WS = process.env.NX_QOVERY_WS,
  OAUTH_DOMAIN = process.env.NX_OAUTH_DOMAIN,
  OAUTH_KEY = process.env.NX_OAUTH_KEY,
  OAUTH_AUDIENCE = process.env.NX_OAUTH_AUDIENCE,
  INTERCOM = process.env.NX_INTERCOM,
  POSTHOG = process.env.NX_POSTHOG,
  POSTHOG_APIHOST = process.env.NX_POSTHOG_APIHOST,
  LOGROCKET = process.env.NX_LOGROCKET,
  GTM = process.env.NX_GTM,
  INSTATUS_APP_ID = process.env.NX_INSTATUS_APP_ID,
  ALGOLIA_APP_ID = process.env.NX_ALGOLIA_APP_ID,
  ALGOLIA_API_KEY = process.env.NX_ALGOLIA_API_KEY
