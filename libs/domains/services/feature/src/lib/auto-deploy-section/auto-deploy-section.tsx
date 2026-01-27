import { useFormContext } from 'react-hook-form'
import { Button } from '@qovery/shared/ui'
import { AutoDeploySetting, type AutoDeploySettingProps } from '../auto-deploy-setting/auto-deploy-setting'
import { GitWebhookStatusBadge } from '../git-webhook-status-badge/git-webhook-status-badge'
import { useGitWebhookStatus } from '../hooks/use-git-webhook-status/use-git-webhook-status'
import { useSyncGitWebhook } from '../hooks/use-sync-git-webhook/use-sync-git-webhook'

export interface AutoDeploySectionProps extends AutoDeploySettingProps {
  serviceId: string
}

export function AutoDeploySection({ serviceId, source, className }: AutoDeploySectionProps) {
  const { watch } = useFormContext()
  const autoDeployEnabled = watch('auto_deploy')
  const supportsWebhook = source !== 'CONTAINER_REGISTRY'

  const { data: webhookStatus } = useGitWebhookStatus({ serviceId, enabled: supportsWebhook })
  const { mutate: syncWebhook, isLoading: isSyncing } = useSyncGitWebhook({ serviceId })

  const shouldShowWebhook = supportsWebhook && autoDeployEnabled
  const showSyncButton = webhookStatus && webhookStatus.status !== 'ACTIVE'

  return (
    <div className="overflow-hidden rounded-md border border-neutral-200">
      <div className="p-4">
        <AutoDeploySetting source={source} className={className} />
      </div>
      {shouldShowWebhook && (
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-100 px-4 py-3">
          <GitWebhookStatusBadge serviceId={serviceId} />
          {showSyncButton && (
            <Button
              type="button"
              variant="surface"
              color="neutral"
              size="sm"
              onClick={() => syncWebhook()}
              loading={isSyncing}
            >
              Update Webhook
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default AutoDeploySection
