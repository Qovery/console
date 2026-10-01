declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

export function pushToDataLayer(data: Record<string, unknown>) {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(data)
}
