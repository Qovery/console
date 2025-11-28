import { useState } from 'react'
import { Button, Icon, InputToggle } from '@qovery/shared/ui'

const NOTIFICATION_MODAL_SEEN_KEY = 'cluster-notification-permission-modal-seen'

const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission()
    } catch (error) {
      console.error(error)
    }
  }
}

const requestSoundPermission = async () => {
  if (typeof window === 'undefined') return
  const AudioContextConstructor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextConstructor) return

  const audioContext = new AudioContextConstructor()
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  // Play a short, quiet tone to unlock audio playback after user confirmation.
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
  gainNode.gain.setValueAtTime(0.05, audioContext.currentTime)
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.12)
  oscillator.onended = () => {
    oscillator.disconnect()
    gainNode.disconnect()
    audioContext.close().catch(() => null)
  }
}

export const getNotificationModalSeen = () => {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(NOTIFICATION_MODAL_SEEN_KEY) === 'true'
}

export const setNotificationModalSeen = () => {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTIFICATION_MODAL_SEEN_KEY, 'true')
}

export interface ClusterNotificationPermissionModalProps {
  onClose: () => void
}

export function ClusterNotificationPermissionModal({ onClose }: ClusterNotificationPermissionModalProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
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
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon iconName="bell-on" iconStyle="regular" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-neutral-400">Stay informed while we install your cluster</h2>
          <p className="text-sm text-neutral-350">
            Enable alerts so we can notify you when installation completes. You can adjust these permissions in your
            browser settings anytime.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <InputToggle
          value={notificationsEnabled}
          onChange={setNotificationsEnabled}
          title="Browser notifications"
          description="Get a desktop notification when your cluster is ready."
        />
        <InputToggle
          value={soundEnabled}
          onChange={setSoundEnabled}
          title="Sound alert"
          description="Play a short sound when the installation finishes."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button size="lg" variant="plain" color="neutral" onClick={onClose}>
          Not now
        </Button>
        <Button size="lg" onClick={handleConfirm} loading={isConfirming}>
          Confirm
        </Button>
      </div>
    </div>
  )
}

export default ClusterNotificationPermissionModal
