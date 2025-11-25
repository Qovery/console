import { useState } from 'react'
import { Button, Icon, InputToggle } from '@qovery/shared/ui'

export interface NotificationPermissionsModalProps {
  onConfirm: (payload: { enableBrowserNotifications: boolean; enableSound: boolean }) => Promise<void> | void
  onClose: () => void
}

export function NotificationPermissionsModal({ onConfirm, onClose }: NotificationPermissionsModalProps) {
  const [enableBrowserNotifications, setEnableBrowserNotifications] = useState(true)
  const [enableSound, setEnableSound] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm({ enableBrowserNotifications, enableSound })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-500">
          <Icon iconName="bell" iconStyle="regular" />
        </div>
        <div>
          <h2 className="h4 mb-1 text-neutral-500">Stay informed</h2>
          <p className="text-sm text-neutral-350">
            Enable browser notifications and sound alerts so you don&apos;t miss when your cluster finishes installing.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <InputToggle
          title="Browser notifications"
          description="Ask your browser to show Qovery notifications for cluster events."
          value={enableBrowserNotifications}
          onChange={setEnableBrowserNotifications}
          dataTestId="toggle-browser-notifications"
        />
        <InputToggle
          title="Sound"
          description="Play a short sound when important cluster actions complete."
          value={enableSound}
          onChange={setEnableSound}
          dataTestId="toggle-sound"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" color="neutral" variant="plain" size="lg" onClick={onClose}>
          Not now
        </Button>
        <Button loading={isSubmitting} size="lg" onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  )
}

export default NotificationPermissionsModal
