import { type SecretManagerAccess } from 'qovery-typescript-axios'
import {
  getReadableSecretManagerAuth,
  getReadableSecretManagerProvider,
  getSecretManagerProvider,
} from '@qovery/domains/clusters/data-access'
import { Button, Icon, Indicator, Tooltip } from '@qovery/shared/ui'
import { useSecretManagerAssociatedServices } from '../../hooks/use-secret-manager-associated-services/use-secret-manager-associated-services'

export interface SecretManagerListProps {
  secretManagers: SecretManagerAccess[]
  onEdit: (manager: SecretManagerAccess) => void
  onDelete: (manager: SecretManagerAccess) => void
  onViewAssociatedExternalSecrets?: (manager: SecretManagerAccess) => void
}

function SecretManagerItem({
  manager,
  onViewAssociatedExternalSecrets,
  onEdit,
  onDelete,
}: {
  manager: SecretManagerAccess
  onViewAssociatedExternalSecrets?: SecretManagerListProps['onViewAssociatedExternalSecrets']
  onEdit: SecretManagerListProps['onEdit']
  onDelete: SecretManagerListProps['onDelete']
}) {
  const { data: secretManagerAssociatedExternalSecrets = [] } = useSecretManagerAssociatedServices({
    secretManagerAccessId: manager.id,
    enabled: Boolean(onViewAssociatedExternalSecrets),
    suspense: Boolean(onViewAssociatedExternalSecrets),
  })
  const hasAssociatedExternalSecrets = secretManagerAssociatedExternalSecrets.length > 0

  return (
    <div key={manager.id} className={`flex items-center justify-between gap-3 p-3 `}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Icon name={getSecretManagerProvider(manager)} width={24} height={24} />
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-[13px] leading-4">
          <p className="truncate font-medium text-neutral">{manager.name}</p>
          <div className="flex flex-nowrap items-center gap-2 text-neutral-subtle">
            <span>
              Type: <span className="text-neutral">{getReadableSecretManagerProvider(manager)}</span>
            </span>
            <span>
              Authentication: <span className="text-neutral">{getReadableSecretManagerAuth(manager)}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onViewAssociatedExternalSecrets && (
          <Indicator
            content={
              <span className="relative right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-surface-brand-solid text-3xs font-bold leading-[0] text-neutralInvert">
                {secretManagerAssociatedExternalSecrets.length ?? 0}
              </span>
            }
          >
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="md"
              iconOnly
              className="relative"
              disabled={!hasAssociatedExternalSecrets}
              aria-label="View associated external secrets"
              onClick={() => onViewAssociatedExternalSecrets(manager)}
            >
              <Icon iconName="layer-group" iconStyle="regular" />
            </Button>
          </Indicator>
        )}
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="md"
          iconOnly
          aria-label="Edit secret manager"
          onClick={() => onEdit(manager)}
        >
          <Icon iconName="pen" iconStyle="regular" className="text-xs" />
        </Button>
        <Tooltip
          content="This secret manager is used by external secrets. Remove the associated external secrets before deleting it."
          disabled={!hasAssociatedExternalSecrets}
        >
          <span>
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="md"
              iconOnly
              aria-label="Delete secret manager"
              disabled={hasAssociatedExternalSecrets}
              onClick={() => onDelete(manager)}
            >
              <Icon iconName="trash" iconStyle="regular" className="text-xs" />
            </Button>
          </span>
        </Tooltip>
      </div>
    </div>
  )
}

export function SecretManagerList({
  secretManagers,
  onEdit,
  onDelete,
  onViewAssociatedExternalSecrets,
}: SecretManagerListProps) {
  if (secretManagers.length === 0) return null

  return (
    <div className="w-full rounded-md border border-neutral bg-surface-neutral-subtle">
      {secretManagers.map((manager, index) => (
        <SecretManagerItem
          key={manager.id + index}
          manager={manager}
          onViewAssociatedExternalSecrets={onViewAssociatedExternalSecrets}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
