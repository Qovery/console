import { Badge, Button, EmptyState, Tooltip } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'

const SECRET_MANAGER_EARLY_ACCESS_FORM_SLUG = 'request-access-secrets-manager'

export function SecretManagerFeatureFlagEntryPoint() {
  const { showPylonForm } = useSupportChat()

  return (
    <div className="bg-background">
      <EmptyState
        title={
          <span className="inline-flex items-center justify-center gap-2">
            Secret manager integration
            <Tooltip content="This feature is in beta. Behaviour and accessibility may change when released in GA.">
              <Badge size="sm" radius="full" variant="surface" color="purple" className="text-[13px]">
                Beta
              </Badge>
            </Tooltip>
          </span>
        }
        description="Connect your external secret manager to Qovery and expose secrets as variables across the services running on your cluster."
        icon="lock-keyhole"
        className="rounded-none border-0 bg-transparent py-12"
      >
        <Button
          color="neutral"
          variant="solid"
          size="md"
          type="button"
          onClick={() => showPylonForm(SECRET_MANAGER_EARLY_ACCESS_FORM_SLUG)}
        >
          Ask for early access
        </Button>
      </EmptyState>
    </div>
  )
}
