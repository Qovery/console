const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_landing_page',
  'gclid',
] as const

// Attribution params stored on landing, forwarded with the sign-up event for HubSpot
export function getUtmParams(): Record<(typeof UTM_KEYS)[number], string | null> {
  return Object.fromEntries(
    UTM_KEYS.map((key) => {
      try {
        return [key, localStorage.getItem(key)]
      } catch {
        return [key, null]
      }
    })
  ) as Record<(typeof UTM_KEYS)[number], string | null>
}
