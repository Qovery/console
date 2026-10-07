import { Button, EmptyState } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'

const SECRET_MANAGER_EARLY_ACCESS_FORM_SLUG = 'request-access-secrets-manager'

export function SecretManagerFeatureFlagEntryPoint() {
  const { showPylonForm } = useSupportChat()

  return (
    <div className="bg-background">
      <EmptyState
        title="Secret manager integration"
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
