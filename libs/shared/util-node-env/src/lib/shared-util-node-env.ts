declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string
      NX_PUBLIC_GIT_SHA: string
      NX_PUBLIC_QOVERY_API: string
      NX_PUBLIC_QOVERY_WS: string
      NX_PUBLIC_OAUTH_DOMAIN: string
      NX_PUBLIC_OAUTH_KEY: string
      NX_PUBLIC_OAUTH_AUDIENCE: string
      NX_PUBLIC_INTERCOM: string
      NX_PUBLIC_POSTHOG: string
      NX_PUBLIC_POSTHOG_APIHOST: string
      NX_PUBLIC_GTM: string
      NX_PUBLIC_INSTATUS_APP_ID: string
      NX_PUBLIC_ALGOLIA_APP_ID: string
      NX_PUBLIC_ALGOLIA_API_KEY: string
    }
  }
}

export const NODE_ENV = process.env.NODE_ENV,
  GIT_SHA = process.env.NX_PUBLIC_GIT_SHA,
  QOVERY_API = process.env.NX_PUBLIC_QOVERY_API,
  QOVERY_WS = process.env.NX_PUBLIC_QOVERY_WS,
  OAUTH_DOMAIN = process.env.NX_PUBLIC_OAUTH_DOMAIN,
  OAUTH_KEY = process.env.NX_PUBLIC_OAUTH_KEY,
  OAUTH_AUDIENCE = process.env.NX_PUBLIC_OAUTH_AUDIENCE,
  INTERCOM = process.env.NX_PUBLIC_INTERCOM,
  POSTHOG = process.env.NX_PUBLIC_POSTHOG,
  POSTHOG_APIHOST = process.env.NX_PUBLIC_POSTHOG_APIHOST,
  GTM = process.env.NX_PUBLIC_GTM,
  INSTATUS_APP_ID = process.env.NX_PUBLIC_INSTATUS_APP_ID,
  ALGOLIA_APP_ID = process.env.NX_PUBLIC_ALGOLIA_APP_ID,
  ALGOLIA_API_KEY = process.env.NX_PUBLIC_ALGOLIA_API_KEY
