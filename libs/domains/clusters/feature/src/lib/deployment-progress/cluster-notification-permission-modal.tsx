import { useCallback, useState } from 'react'
import { Button, Icon, InputToggle, useModal } from '@qovery/shared/ui'

const NOTIFICATION_MODAL_SEEN_KEY = 'cluster-notification-permission-modal-v2-seen'
const NOTIFICATION_ENABLED_KEY = 'cluster-notification-enabled'
const SOUND_ENABLED_KEY = 'cluster-sound-enabled'

const isBrowserNotificationSupported = () => typeof window !== 'undefined' && 'Notification' in window

const requestNotificationPermission = async () => {
  if (!isBrowserNotificationSupported()) return
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission()
    } catch (error) {
      console.error(error)
    }
  }
}

const requestSoundPermission = async () => {
  // Intentionally left blank: no sound is played, we only record the user's choice.
  return
}

const getStoredBoolean = (key: string) => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(key) === 'true'
}

export const getNotificationModalSeen = () => {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(NOTIFICATION_MODAL_SEEN_KEY) === 'true'
}

export const setNotificationModalSeen = () => {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTIFICATION_MODAL_SEEN_KEY, 'true')
}

export const setClusterNotificationEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTIFICATION_ENABLED_KEY, enabled ? 'true' : 'false')
}

export const setClusterSoundEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false')
}

export const isClusterNotificationEnabled = () =>
  isBrowserNotificationSupported() && Notification.permission === 'granted' && getStoredBoolean(NOTIFICATION_ENABLED_KEY)

export const isClusterSoundEnabled = () => getStoredBoolean(SOUND_ENABLED_KEY)

export interface ClusterNotificationPermissionModalProps {
  onClose: () => void
}

export function ClusterNotificationPermissionModal({ onClose }: ClusterNotificationPermissionModalProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => getStoredBoolean(NOTIFICATION_ENABLED_KEY))
  const [soundEnabled, setSoundEnabled] = useState(() => getStoredBoolean(SOUND_ENABLED_KEY))
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setNotificationModalSeen()
    setClusterNotificationEnabled(notificationsEnabled)
    setClusterSoundEnabled(soundEnabled)

    if (!notificationsEnabled && !soundEnabled) {
      onClose()
      return
    }

    setIsConfirming(true)
    try {
      if (notificationsEnabled) {
        await requestNotificationPermission()
      }

      if (soundEnabled) {
        await requestSoundPermission()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsConfirming(false)
      onClose()
    }
  }

  return (
    <div className="w-full p-5">
      <div>
        <h2 className="h4 max-w-sm text-neutral-400">Get notified at completion</h2>
        <p className="mt-2 text-sm text-neutral-350">
          Choose how you want to be alerted when the installation completes.
        </p>
      </div>

      <div className="mt-3">
        <InputToggle
          small
          value={notificationsEnabled}
          onChange={setNotificationsEnabled}
          title="Browser notifications"
          description="Receive a browser notification when the installation completes"
          className="border-b border-neutral-200 py-4"
        />
        <InputToggle
          small
          value={soundEnabled}
          onChange={setSoundEnabled}
          title="Sound alert"
          description="Play a short sound when the installation completes"
          className="py-4"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          size="lg"
          variant="plain"
          color="neutral"
          onClick={() => {
            setNotificationModalSeen()
            onClose()
          }}
        >
          Not now
        </Button>
        <Button size="lg" onClick={handleConfirm} loading={isConfirming}>
          Confirm
        </Button>
      </div>
    </div>
  )
}

export function useNotificationPermissionModal() {
  const { openModal, closeModal } = useModal()

  const showNotificationPermissionModal = useCallback(
    (onAfterClose?: () => void, force?: boolean) => {
      if (!force && getNotificationModalSeen()) {
        onAfterClose?.()
        return
      }

      openModal({
        content: (
          <ClusterNotificationPermissionModal
            onClose={() => {
              closeModal()
              onAfterClose?.()
            }}
          />
        ),
      })
    },
    [closeModal, openModal]
  )

  return { showNotificationPermissionModal }
}

export default ClusterNotificationPermissionModal
