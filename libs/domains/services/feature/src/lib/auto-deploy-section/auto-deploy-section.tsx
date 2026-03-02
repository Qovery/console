import { type ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@qovery/shared/ui'
import { AutoDeploySetting, type AutoDeploySettingProps } from '../auto-deploy-setting/auto-deploy-setting'
import { GitWebhookStatusBadge } from '../git-webhook-status-badge/git-webhook-status-badge'
import { useGitWebhookStatus } from '../hooks/use-git-webhook-status/use-git-webhook-status'
import { useSyncGitWebhook } from '../hooks/use-sync-git-webhook/use-sync-git-webhook'

export interface AutoDeploySectionProps extends AutoDeploySettingProps {
  serviceId: string
  children?: ReactNode
}

export function AutoDeploySection({ serviceId, source, className, children }: AutoDeploySectionProps) {
  const { watch } = useFormContext()
  const autoDeployEnabled = watch('auto_deploy')
  const supportsWebhook = source !== 'CONTAINER_REGISTRY'

  const { data: webhookStatus } = useGitWebhookStatus({ serviceId, enabled: supportsWebhook })
  const { mutate: syncWebhook, isLoading: isSyncing } = useSyncGitWebhook({ serviceId })

  const shouldShowWebhook = supportsWebhook && autoDeployEnabled
  const showSyncButton = webhookStatus && webhookStatus.status !== 'ACTIVE'
  const isTerraform = source === 'TERRAFORM'

  return (
    <div className="rounded-md border border-neutral-200">
      <div className="p-4">
        <AutoDeploySetting
          source={source}
          className={className}
          titleSuffix={isTerraform && shouldShowWebhook ? <GitWebhookStatusBadge serviceId={serviceId} /> : undefined}
        />
      </div>
      {!isTerraform && shouldShowWebhook && (
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
      {children && autoDeployEnabled && (
        <div className="border-t border-neutral-200 bg-neutral-100 p-4">{children}</div>
      )}
    </div>
  )
}

export default AutoDeploySection
