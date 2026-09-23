declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

const GOOGLE_TAG_MANAGER_SCRIPT_ID = 'google-tag-manager'

// Equivalent of the official GTM snippet, loaded as an external script so it runs under a CSP without 'unsafe-inline'
export function loadGoogleTagManager(id: string) {
  if (document.getElementById(GOOGLE_TAG_MANAGER_SCRIPT_ID)) return

  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.id = GOOGLE_TAG_MANAGER_SCRIPT_ID
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`
  document.head.appendChild(script)
}

export function pushToDataLayer(data: Record<string, unknown>) {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(data)
}
