import { type Dispatch, type SetStateAction, useCallback, useEffect, useSyncExternalStore } from 'react'

function dispatchStorageEvent(key: string, newValue: string | null) {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue }))
}

function setLocalStorageItem<T>(key: string, value: T) {
  const localStorageValue = typeof value === 'string' ? value : JSON.stringify(value)
  window.localStorage.setItem(key, localStorageValue)
  dispatchStorageEvent(key, localStorageValue)
}

function removeLocalStorageItem(key: string) {
  window.localStorage.removeItem(key)
  dispatchStorageEvent(key, null)
}

function getLocalStorageItem(key: string) {
  return window.localStorage.getItem(key)
}

function subscribeToLocalStorage(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getLocalStorageServerSnapshot(): never {
  throw Error('useLocalStorage is a client-only hook')
}

function parseLocalStorageValue<T>(storedValue: string | null, initialValue: T) {
  if (storedValue === null) {
    return initialValue
  }

  try {
    return JSON.parse(storedValue) as T
  } catch {
    if (typeof initialValue === 'string' || initialValue === undefined || initialValue === null) {
      return storedValue as T
    }

    return initialValue
  }
}

export function useLocalStorage<T>(key: string, initialValue?: T): [T, Dispatch<SetStateAction<T>>] {
  const getSnapshot = () => getLocalStorageItem(key)
  const store = useSyncExternalStore(subscribeToLocalStorage, getSnapshot, getLocalStorageServerSnapshot)

  const setState = useCallback(
    (value: SetStateAction<T>) => {
      try {
        const currentValue = parseLocalStorageValue(store, initialValue as T)
        const nextState = typeof value === 'function' ? (value as (previousValue: T) => T)(currentValue) : value

        if (nextState === undefined || nextState === null) {
          removeLocalStorageItem(key)
        } else {
          setLocalStorageItem(key, nextState)
        }
      } catch (error) {
        console.warn(error)
      }
    },
    [initialValue, key, store]
  )

  useEffect(() => {
    if (getLocalStorageItem(key) === null && typeof initialValue !== 'undefined') {
      setLocalStorageItem(key, initialValue)
    }
  }, [initialValue, key])

  return [parseLocalStorageValue(store, initialValue as T), setState]
}
