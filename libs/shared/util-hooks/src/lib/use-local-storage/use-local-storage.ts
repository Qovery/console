// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useLocalStorage as useLocalStorageBase } from '@uidotdev/usehooks'

function safelyParseLocalStorageValue(value: string) {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

// This function ensures that the value in localStorage is a JSON object.
// If the value is not a JSON object, it will be converted to a JSON object.
// If the value is a string, it will be stored as a string.
// If the value is undefined or null, it will be removed from localStorage.
function ensureJsonLocalStorageValue<T>(key: string, initialValue?: T) {
  const value = window.localStorage.getItem(key)

  if (value === null || safelyParseLocalStorageValue(value)) {
    return
  }

  if (typeof initialValue === 'string' || initialValue === undefined || initialValue === null) {
    window.localStorage.setItem(key, JSON.stringify(value))
    return
  }

  window.localStorage.setItem(key, JSON.stringify(initialValue))
}

export function useLocalStorage<T>(key: string, initialValue?: T) {
  ensureJsonLocalStorageValue(key, initialValue)

  return useLocalStorageBase<T>(key, initialValue)
}
