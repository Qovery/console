import { useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useDeleteArgoCdCredentials } from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  BlockContent,
  Button,
  EmptyState,
  Icon,
  ModalConfirmation,
  Section,
  Skeleton,
  useModal,
} from '@qovery/shared/ui'
import { dateMediumLocalFormat, dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type OrganizationArgoCdIntegration } from '../hooks/use-organization-argocd-integrations/use-organization-argocd-integrations'
import { useOrganizationArgoCdIntegrations } from '../hooks/use-organization-argocd-integrations/use-organization-argocd-integrations'
import { ConnectArgoCdModal } from './connect-argocd-modal/connect-argocd-modal'

const ArgoCdIntegrationRowsSkeleton = () => (
  <ul>
    {[0, 1, 2].map((index) => (
      <li key={index} className="flex items-center justify-between border-b border-neutral p-4 last:border-0">
        <div className="flex items-center gap-4">
          <Skeleton width={20} height={20} show={true} />
          <div className="space-y-2">
            <Skeleton width={220} height={12} show={true} />
            <Skeleton width={240} height={12} show={true} />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton width={32} height={32} show={true} />
          <Skeleton width={32} height={32} show={true} />
        </div>
      </li>
    ))}
  </ul>
)

interface ArgoCdIntegrationRowProps {
  integration: OrganizationArgoCdIntegration
  onEdit: (integration: OrganizationArgoCdIntegration) => void
  onDelete: (integration: OrganizationArgoCdIntegration) => void
}

function ArgoCdIntegrationRow({ integration, onEdit, onDelete }: ArgoCdIntegrationRowProps) {
  return (
    <li
      className="flex items-center justify-between border-b border-neutral p-4 last:border-0"
      data-testid={`argocd-integration-${integration.clusterId}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-5 w-5 items-center justify-center">
          {integration.clusterCloudProvider ? (
            <Icon name={integration.clusterCloudProvider} width="20" height="20" />
          ) : (
            <Icon iconName="link" iconStyle="regular" className="text-sm text-neutral-subtle" />
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-neutral">{integration.clusterName}</p>
          <p className="mt-1 text-xs text-neutral-subtle">{integration.argoCdUrl}</p>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-subtle">
            {integration.lastCheckedAt ? (
              <span title={dateUTCString(integration.lastCheckedAt)}>
                Last checked {timeAgo(new Date(integration.lastCheckedAt))}
              </span>
            ) : (
              <span>Not checked yet</span>
            )}
            <span title={dateUTCString(integration.createdAt)}>
              Created since {dateMediumLocalFormat(integration.createdAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="md"
          variant="outline"
          color="neutral"
          iconOnly
          onClick={() => onEdit(integration)}
          data-testid="edit-argocd-integration"
        >
          <Icon iconName="gear" iconStyle="regular" />
        </Button>
        <Button
          size="md"
          variant="outline"
          color="neutral"
          iconOnly
          onClick={() => onDelete(integration)}
          data-testid="delete-argocd-integration"
        >
          <Icon iconName="trash-can" iconStyle="regular" />
        </Button>
      </div>
    </li>
  )
}

export function SettingsArgoCdIntegration() {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: integrations = [], isLoading } = useOrganizationArgoCdIntegrations({
    organizationId,
    enabled: !!organizationId,
  })
  const { mutateAsync: deleteArgoCdCredentials } = useDeleteArgoCdCredentials()
  const { openModal, closeModal } = useModal()

  useDocumentTitle('ArgoCD integration - Organization settings')

  const configuredClusterIds = useMemo(() => integrations.map(({ clusterId }) => clusterId), [integrations])

  const openCreateModal = () => {
    openModal({
      content: (
        <ConnectArgoCdModal
          organizationId={organizationId}
          configuredClusterIds={configuredClusterIds}
          onClose={closeModal}
        />
      ),
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  const openEditModal = (integration: OrganizationArgoCdIntegration) => {
    openModal({
      content: (
        <ConnectArgoCdModal
          organizationId={organizationId}
          configuredClusterIds={configuredClusterIds}
          integration={{
            clusterId: integration.clusterId,
            clusterName: integration.clusterName,
            clusterCloudProvider: integration.clusterCloudProvider,
            argoCdUrl: integration.argoCdUrl,
          }}
          onClose={closeModal}
        />
      ),
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  const openDeleteModal = (integration: OrganizationArgoCdIntegration) => {
    openModal({
      content: (
        <ModalConfirmation
          title="Remove ArgoCD integration"
          description={`To confirm the deletion of the integration, please type "delete"`}
          callback={() =>
            deleteArgoCdCredentials({
              clusterId: integration.clusterId,
            })
          }
          confirmationMethod="action"
          confirmationAction="delete"
          placeholder={`Enter "delete"`}
          warning="Qovery will stop discovering applications from this ArgoCD instance until you reconnect it."
        />
      ),
      options: {
        width: 488,
      },
    })
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="px-8 pb-8 pt-6">
        <div className="relative">
          <SettingsHeading
            title="ArgoCD integration"
            description="Connect the ArgoCD instances running on your organization clusters to let Qovery discover their applications."
            showNeedHelp={false}
          />
          <Button size="md" className="absolute right-0 top-0 shrink-0 gap-2" onClick={openCreateModal}>
            Add ArgoCD
            <Icon iconName="circle-plus" iconStyle="regular" />
          </Button>
        </div>

        <div className="max-w-content-with-navigation-left">
          {isLoading ? (
            <BlockContent title="Configured integrations" classNameContent="p-0">
              <ArgoCdIntegrationRowsSkeleton />
            </BlockContent>
          ) : integrations.length > 0 ? (
            <BlockContent title="Configured integrations" classNameContent="p-0">
              <ul>
                {integrations.map((integration) => (
                  <ArgoCdIntegrationRow
                    key={integration.id}
                    integration={integration}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                  />
                ))}
              </ul>
            </BlockContent>
          ) : (
            <EmptyState
              title="No ArgoCD integration configured"
              description="Add your first ArgoCD instance to validate the connection and save it on one of your clusters."
              icon="link"
              className="h-auto min-h-[146px] w-full max-w-[648px] p-8"
            >
              <Button variant="outline" color="neutral" size="md" className="gap-2" onClick={openCreateModal}>
                <Icon iconName="circle-plus" iconStyle="regular" />
                Add ArgoCD
              </Button>
            </EmptyState>
          )}
        </div>
      </Section>
    </div>
  )
}
