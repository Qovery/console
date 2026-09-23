const SNITCHER_SCRIPT_ID = 'snitcher-script'

// Replaces the Snitcher GTM Custom HTML tag, which GTM injected as an inline script.
// The profile script bootstraps Snitcher on its own, so the legacy inline `snid` queue is not needed.
export function loadSnitcher(profileId: string) {
  if (document.getElementById(SNITCHER_SCRIPT_ID)) return

  const script = document.createElement('script')
  script.id = SNITCHER_SCRIPT_ID
  script.async = true
  script.src = `https://snid.snitcher.com/${encodeURIComponent(profileId)}.js`
  document.head.appendChild(script)
}
