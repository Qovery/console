// Primary input is a finger. Matches the CSS `[@media(pointer:coarse)]` variant used for touch-only styles.
export function isTouchScreen(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: coarse)').matches
    : false
}
