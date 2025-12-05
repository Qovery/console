import { useCallback } from 'react'
import { useLocalStorage } from '../../index'

const isBrowserNotificationSupported = (): boolean => typeof window !== 'undefined' && 'Notification' in window

const getStoredBoolean = (key: string): boolean => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(key) === 'true'
}

const requestNotificationPermission = async (): Promise<void> => {
  if (!isBrowserNotificationSupported()) return
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission()
    } catch (error) {
      console.error(error)
    }
  }
}

const requestSoundPermission = async (): Promise<void> => {
  return
}

export const isNotificationEnabled = (notificationEnabledKey: string): boolean =>
  isBrowserNotificationSupported() && Notification.permission === 'granted' && getStoredBoolean(notificationEnabledKey)

export const isSoundEnabled = (soundEnabledKey: string): boolean => getStoredBoolean(soundEnabledKey)

export interface UseNotificationPreferencesOptions {
  prefix: string
}

export function useNotificationPreferences(options: UseNotificationPreferencesOptions) {
  const { prefix } = options
  const notificationEnabledKey = `${prefix}-notification-enabled`
  const soundEnabledKey = `${prefix}-sound-enabled`

  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage<boolean>(notificationEnabledKey, false)
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>(soundEnabledKey, false)

  const requestPermission = useCallback(async () => {
    if (notificationsEnabled) {
      await requestNotificationPermission()
    }
    if (soundEnabled) {
      await requestSoundPermission()
    }
  }, [notificationsEnabled, soundEnabled])

  const checkNotificationEnabled = useCallback((): boolean => {
    return isNotificationEnabled(notificationEnabledKey)
  }, [notificationEnabledKey])

  const checkSoundEnabled = useCallback((): boolean => {
    return isSoundEnabled(soundEnabledKey)
  }, [soundEnabledKey])

  return {
    notificationsEnabled,
    setNotificationsEnabled,
    soundEnabled,
    setSoundEnabled,
    requestPermission,
    isNotificationEnabled: checkNotificationEnabled,
    isSoundEnabled: checkSoundEnabled,
    isBrowserNotificationSupported: isBrowserNotificationSupported(),
    soundEnabledKey,
    notificationEnabledKey,
  }
}
