import { act, renderHook } from '@qovery/shared/util-tests'
import { isNotificationEnabled, isSoundEnabled, useNotificationPreferences } from './use-notification-preferences'

describe('useNotificationPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window, 'Notification', {
      writable: true,
      value: {
        permission: 'default',
        requestPermission: jest.fn().mockResolvedValue('granted'),
      },
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useNotificationPreferences({ prefix: 'test' }))

    expect(result.current.notificationsEnabled).toBe(false)
    expect(result.current.soundEnabled).toBe(false)
  })

  it('should not request notification permission when notificationsEnabled is false', async () => {
    const { result } = renderHook(() => useNotificationPreferences({ prefix: 'test' }))

    await act(async () => {
      await result.current.requestPermission()
    })

    expect(window.Notification.requestPermission).not.toHaveBeenCalled()
  })

  it('should check browser notification support', () => {
    const { result } = renderHook(() => useNotificationPreferences({ prefix: 'test' }))

    expect(result.current.isBrowserNotificationSupported).toBe(true)
  })
})

describe('isNotificationEnabled', () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window, 'Notification', {
      writable: true,
      value: {
        permission: 'granted',
      },
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return false when browser does not support notifications', () => {
    Object.defineProperty(window, 'Notification', {
      writable: true,
      value: undefined,
    })

    expect(isNotificationEnabled('test-notification-enabled')).toBe(false)
  })

  it('should return false when permission is not granted', () => {
    Object.defineProperty(window, 'Notification', {
      writable: true,
      value: {
        permission: 'denied',
      },
    })

    expect(isNotificationEnabled('test-notification-enabled')).toBe(false)
  })

  it('should return false when localStorage value is false', () => {
    localStorage.setItem('test-notification-enabled', 'false')

    expect(isNotificationEnabled('test-notification-enabled')).toBe(false)
  })

  it('should return true when all conditions are met', () => {
    localStorage.setItem('test-notification-enabled', 'true')

    expect(isNotificationEnabled('test-notification-enabled')).toBe(true)
  })
})

describe('isSoundEnabled', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return false when localStorage value is not set', () => {
    expect(isSoundEnabled('test-sound-enabled')).toBe(false)
  })

  it('should return false when localStorage value is false', () => {
    localStorage.setItem('test-sound-enabled', 'false')

    expect(isSoundEnabled('test-sound-enabled')).toBe(false)
  })

  it('should return true when localStorage value is true', () => {
    localStorage.setItem('test-sound-enabled', 'true')

    expect(isSoundEnabled('test-sound-enabled')).toBe(true)
  })
})
