export type PresentationState<T> =
  | { status: 'loading'; data: undefined }
  | { status: 'unavailable'; data: null }
  | { status: 'available'; data: T }

// Normalize the cache sentinels at the presentation boundary.
export function getPresentationState<T extends object>(data: T | 'NotFound' | null | undefined): PresentationState<T> {
  if (data === undefined) return { status: 'loading', data: undefined }
  if (data === null || data === 'NotFound') return { status: 'unavailable', data: null }
  return { status: 'available', data }
}
