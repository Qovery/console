import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CLUSTERS_GENERAL_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { Button, InputToggle } from '@qovery/shared/ui'
import { useLocalStorage, useNotificationPreferences } from '@qovery/shared/util-hooks'
import { SHOW_SELF_MANAGED_GUIDE_KEY } from '../../cluster-action-toolbar/cluster-action-toolbar'

const NOTIFICATION_MODAL_SEEN_KEY = 'cluster-notification-permission-modal-v2-seen'

export interface ClusterNotificationPermissionModalProps {
  organizationId: string
  onClose: () => void
  onComplete: () => Promise<void>
  isSelfManaged?: boolean
}

export function ClusterNotificationPermissionModal({
  organizationId,
  onClose,
  onComplete,
  isSelfManaged = false,
}: ClusterNotificationPermissionModalProps) {
  const navigate = useNavigate()
  const { notificationsEnabled, setNotificationsEnabled, soundEnabled, setSoundEnabled, requestPermission } =
    useNotificationPreferences({ prefix: 'cluster' })
  const [, setModalSeen] = useLocalStorage<boolean>(NOTIFICATION_MODAL_SEEN_KEY, false)
  const [isConfirming, setIsConfirming] = useState(false)

  const navigateToClusters = useCallback(() => {
    if (isSelfManaged) {
      navigate({
        pathname: CLUSTERS_URL(organizationId) + CLUSTERS_GENERAL_URL,
        search: `?${SHOW_SELF_MANAGED_GUIDE_KEY}`,
      })
    } else {
      navigate(CLUSTERS_URL(organizationId))
    }
  }, [navigate, organizationId, isSelfManaged])

  const handleConfirm = async () => {
    setModalSeen(true)

    if (!notificationsEnabled && !soundEnabled) {
      onClose()
      await onComplete()
      return
    }

    setIsConfirming(true)
    try {
      await requestPermission()
    } catch (error) {
      console.error(error)
    } finally {
      setIsConfirming(false)
      onClose()
      await onComplete()
      navigateToClusters()
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
          forceAlignTop
        />
        <InputToggle
          small
          value={soundEnabled}
          onChange={setSoundEnabled}
          title="Sound alert"
          description="Play a short sound when the installation completes"
          className="py-4"
          forceAlignTop
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          size="lg"
          variant="plain"
          color="neutral"
          onClick={async () => {
            setModalSeen(true)
            try {
              await onComplete()
              navigateToClusters()
            } catch (error) {
              console.error(error)
            } finally {
              onClose()
            }
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

export default ClusterNotificationPermissionModal
