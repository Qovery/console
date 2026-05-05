import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { useParams } from '@tanstack/react-router'
import {
  type ArgoCdInstanceMappingResponse,
  type ArgoCdLinkedClusterDetails,
  type ArgoCdUnlinkedClusterDetails,
  type KubernetesEnum,
} from 'qovery-typescript-axios'
import { type ReactNode, Suspense, useEffect, useMemo, useState } from 'react'
import { useDeleteArgoCdCredentials } from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, Button, EmptyState, Icon, Link, ModalConfirmation, Section, useModal } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useOrganizationArgoCdIntegrations } from '../hooks/use-organization-argocd-integrations/use-organization-argocd-integrations'
import { useSaveArgoCdDestinationClusterMapping } from '../hooks/use-save-argocd-destination-cluster-mapping/use-save-argocd-destination-cluster-mapping'
import { ArgoCdIntegrationCardSkeleton } from './argocd-integration-skeleton'
import { ConnectArgoCdModal } from './connect-argocd-modal/connect-argocd-modal'
import { LinkClusterModal, type LinkClusterModalResponse } from './link-cluster-modal/link-cluster-modal'

type OrganizationArgoCdClusterType = 'Qovery managed' | 'Self managed' | 'Partially managed'

const getDestinationClusterName = (destinationCluster: string) =>
  destinationCluster.replace(/^https?:\/\//, '').replace(/\/$/, '')

const getClusterTypeLabel = (clusterType: KubernetesEnum): OrganizationArgoCdClusterType => {
  switch (clusterType) {
    case 'SELF_MANAGED':
      return 'Self managed'
    case 'PARTIALLY_MANAGED':
      return 'Partially managed'
    default:
      return 'Qovery managed'
  }
}

interface ArgoCdSectionProps {
  id: 'linked' | 'unlinked'
  title: string
  count: number
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  hasBottomBorder?: boolean
  children?: ReactNode
}

function ArgoCdSection({
  id,
  title,
  count,
  isOpen,
  onOpenChange,
  hasBottomBorder = true,
  children,
}: ArgoCdSectionProps) {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      value={isOpen ? id : ''}
      onValueChange={(value) => onOpenChange(value === id)}
      className="w-full"
    >
      <AccordionPrimitive.Item value={id} className={hasBottomBorder ? 'w-full border-b border-neutral' : 'w-full'}>
        <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between p-4 text-left">
          <span className={isOpen ? 'text-sm font-medium text-neutral' : 'text-sm font-medium text-neutral-subtle'}>
            {title} ({count})
          </span>
          <Icon
            iconName="angle-down"
            iconStyle="regular"
            className={
              isOpen
                ? 'rotate-180 text-sm text-neutral transition-transform duration-200'
                : 'text-sm text-neutral-subtle transition-transform duration-200'
            }
          />
        </AccordionPrimitive.Trigger>
        <AccordionPrimitive.Content className="data-[state=closed]:slidein-up-sm-faded overflow-hidden px-4 pb-4 data-[state=open]:animate-slidein-down-sm-faded">
          {children}
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  )
}

interface ArgoCdIntegrationCardProps {
  integration: ArgoCdInstanceMappingResponse
  linkedClusterIds: string[]
  onEdit: (integration: ArgoCdInstanceMappingResponse) => void
  onDelete: (integration: ArgoCdInstanceMappingResponse) => void
  onLinkCluster: (
    integrationId: string,
    cluster: ArgoCdUnlinkedClusterDetails,
    response: LinkClusterModalResponse
  ) => void
  onUnlinkCluster: (integrationId: string, cluster: ArgoCdLinkedClusterDetails) => void
}

interface SettingsArgoCdIntegrationContentProps {
  organizationId: string
}

function ArgoCdIntegrationCard({
  integration,
  linkedClusterIds,
  onEdit,
  onDelete,
  onLinkCluster,
  onUnlinkCluster,
}: ArgoCdIntegrationCardProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const [isLinkedSectionOpen, setIsLinkedSectionOpen] = useState(true)
  const [isUnlinkedSectionOpen, setIsUnlinkedSectionOpen] = useState(false)

  const hasLinkedClusters = integration.linked_clusters.length > 0
  const hasUnlinkedClusters = integration.unlinked_clusters.length > 0
  const isImporting = integration.status === 'connected' && !hasLinkedClusters && !hasUnlinkedClusters

  const openLinkClusterModal = (cluster: ArgoCdUnlinkedClusterDetails) => {
    openModal({
      content: (
        <LinkClusterModal
          organizationId={organizationId}
          argoCdClusterName={cluster.argocd_cluster_name ?? getDestinationClusterName(cluster.argocd_cluster_url)}
          linkedClusterIds={linkedClusterIds}
          onClose={(response?: LinkClusterModalResponse) => {
            closeModal()
            if (response) {
              onLinkCluster(integration.credentials_id, cluster, response)
            }
          }}
        />
      ),
      options: {
        width: 488,
      },
    })
  }

  return (
    <div
      className="overflow-hidden rounded-lg bg-surface-neutral-subtle"
      data-testid={`argocd-integration-${integration.credentials_id}`}
    >
      <div className="relative overflow-hidden rounded-lg border border-neutral bg-surface-neutral shadow-[0px_0px_4px_0px_rgba(0,0,0,0.01),0px_2px_3px_0px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-neutral">ArgoCD running on</span>
            <Link
              to="/organization/$organizationId/cluster/$clusterId/overview"
              params={{ organizationId, clusterId: integration.agent_cluster_id }}
              className="flex h-6 items-center gap-1 rounded-md border border-neutral bg-surface-neutral px-1.5 text-ssm font-normal text-neutral hover:bg-surface-neutral-subtle hover:text-neutral"
              data-testid="argocd-cluster-link"
            >
              {integration.agent_cluster_cloud_provider ? (
                <Icon name={integration.agent_cluster_cloud_provider} width="16" height="16" />
              ) : null}
              {integration.agent_cluster_name}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              color="neutral"
              iconOnly
              data-testid="edit-argocd-integration"
              disabled={isImporting}
              onClick={() => onEdit(integration)}
            >
              <Icon iconName="pencil" iconStyle="regular" />
            </Button>
            <Button
              size="xs"
              variant="outline"
              color="neutral"
              iconOnly
              data-testid="delete-argocd-integration"
              disabled={isImporting}
              onClick={() => onDelete(integration)}
            >
              <Icon iconName="trash-can" iconStyle="regular" />
            </Button>
          </div>
        </div>

        {isImporting ? (
          <div className="border-t border-neutral bg-surface-neutral-subtle px-4 py-3">
            <div className="flex items-center gap-2 text-ssm text-neutral">
              <Icon iconName="loader" iconStyle="regular" className="animate-spin text-brand" />
              <span>Importing ArgoCD…</span>
            </div>
          </div>
        ) : null}

        {!isImporting && hasLinkedClusters ? (
          <ArgoCdSection
            id="linked"
            title="Linked clusters"
            count={integration.linked_clusters.length}
            isOpen={isLinkedSectionOpen}
            onOpenChange={setIsLinkedSectionOpen}
            hasBottomBorder={hasUnlinkedClusters}
          >
            <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
              {integration.linked_clusters.map((cluster) => (
                <div
                  key={`${integration.credentials_id}-${cluster.qovery_cluster_id}`}
                  className="flex items-center justify-between border-b border-neutral px-4 py-3 last:border-b-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      {cluster.qovery_cluster_cloud_provider ? (
                        <Icon name={cluster.qovery_cluster_cloud_provider} width="16" height="16" />
                      ) : null}
                      <span className="text-ssm font-medium text-neutral">{cluster.qovery_cluster_name}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-ssm text-neutral-subtle">
                      {cluster.argocd_cluster_name ? (
                        <span>
                          ArgoCD name: <span className="text-neutral">{cluster.argocd_cluster_name}</span>
                        </span>
                      ) : null}
                      <span>
                        Cluster type:{' '}
                        <span className="text-neutral">{getClusterTypeLabel(cluster.qovery_cluster_type)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="md"
                      variant="outline"
                      color="neutral"
                      iconOnly
                      onClick={() => onUnlinkCluster(integration.credentials_id, cluster)}
                      data-testid={`unlink-linked-cluster-${cluster.qovery_cluster_id}`}
                    >
                      <Icon iconName="link-broken" iconStyle="regular" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ArgoCdSection>
        ) : null}

        {!isImporting && hasUnlinkedClusters ? (
          <ArgoCdSection
            id="unlinked"
            title="Unlinked clusters"
            count={integration.unlinked_clusters.length}
            isOpen={isUnlinkedSectionOpen}
            onOpenChange={setIsUnlinkedSectionOpen}
            hasBottomBorder={false}
          >
            <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
              {integration.unlinked_clusters.map((cluster) => (
                <div
                  key={`${integration.credentials_id}-${cluster.argocd_cluster_url}`}
                  className="flex items-center justify-between border-b border-neutral px-4 py-3 last:border-b-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-ssm font-medium text-neutral">
                      {cluster.argocd_cluster_name ?? getDestinationClusterName(cluster.argocd_cluster_url)}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-ssm text-neutral-subtle">
                      <span>
                        Destination:{' '}
                        <span className="text-neutral">{getDestinationClusterName(cluster.argocd_cluster_url)}</span>
                      </span>
                    </div>
                  </div>
                  <Button
                    size="md"
                    variant="outline"
                    color="neutral"
                    iconOnly
                    onClick={() => openLinkClusterModal(cluster)}
                    data-testid={`link-unlinked-cluster-${cluster.argocd_cluster_url}`}
                  >
                    <Icon iconName="link" iconStyle="regular" />
                  </Button>
                </div>
              ))}
            </div>
          </ArgoCdSection>
        ) : null}
      </div>

      {!isImporting ? (
        <div className="-mt-[7px] flex items-center gap-2 rounded-b-lg border border-t-0 border-neutral bg-surface-neutral-subtle px-4 pb-3 pt-[calc(0.75rem+7px)]">
          <Badge size="base" color="green" variant="surface" className="gap-1 font-medium">
            <Icon iconName="circle-check" iconStyle="regular" className="text-xs text-positive" />
            {integration.status === 'connected' ? 'Connected' : 'Unknown'}
          </Badge>
          <p className="text-ssm text-neutral-subtle">
            Last update <span className="text-neutral">{timeAgo(new Date(integration.last_checked_at))}</span>
          </p>
        </div>
      ) : null}
    </div>
  )
}

function SettingsArgoCdIntegrationCreateButton({ organizationId }: SettingsArgoCdIntegrationContentProps) {
  const { data: integrations = [] } = useOrganizationArgoCdIntegrations({
    organizationId,
    suspense: true,
  })
  const { openModal, closeModal } = useModal()
  const configuredClusterIds = useMemo(
    () => integrations.map(({ agent_cluster_id }) => agent_cluster_id),
    [integrations]
  )

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

  return (
    <Button className="gap-1.5" size="md" onClick={openCreateModal}>
      <Icon iconName="circle-plus" iconStyle="regular" />
      Add ArgoCD
    </Button>
  )
}

function SettingsArgoCdIntegrationContent({ organizationId }: SettingsArgoCdIntegrationContentProps) {
  const { data: integrations = [] } = useOrganizationArgoCdIntegrations({
    organizationId,
    suspense: true,
  })
  const { openModal, closeModal } = useModal()
  const { mutateAsync: deleteArgoCdCredentials } = useDeleteArgoCdCredentials({ organizationId })
  const { mutateAsync: saveArgoCdDestinationClusterMapping } = useSaveArgoCdDestinationClusterMapping()
  const [integrationsState, setIntegrationsState] = useState<ArgoCdInstanceMappingResponse[]>([])

  useEffect(() => {
    setIntegrationsState(integrations)
  }, [integrations])

  const configuredClusterIds = useMemo(
    () => integrationsState.map(({ agent_cluster_id }) => agent_cluster_id),
    [integrationsState]
  )

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

  const openEditModal = (integration: ArgoCdInstanceMappingResponse) => {
    openModal({
      content: (
        <ConnectArgoCdModal
          organizationId={organizationId}
          configuredClusterIds={configuredClusterIds}
          integration={integration}
          onClose={closeModal}
        />
      ),
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  const openDeleteModal = (integration: ArgoCdInstanceMappingResponse) => {
    openModal({
      content: (
        <ModalConfirmation
          title="Remove ArgoCD integration"
          description={`To confirm the deletion of the integration, please type "delete"`}
          callback={async () => {
            await deleteArgoCdCredentials({ clusterId: integration.agent_cluster_id })
            setIntegrationsState((current) =>
              current.filter(({ credentials_id }) => credentials_id !== integration.credentials_id)
            )
          }}
          confirmationMethod="action"
          confirmationAction="delete"
          placeholder={`Enter "delete"`}
        />
      ),
      options: {
        width: 488,
      },
    })
  }

  const linkCluster = async (
    integrationId: string,
    cluster: ArgoCdUnlinkedClusterDetails,
    response: LinkClusterModalResponse
  ) => {
    const integration = integrationsState.find(({ credentials_id }) => credentials_id === integrationId)

    if (!integration) {
      return
    }

    await saveArgoCdDestinationClusterMapping({
      organizationId,
      argoCdDestinationClusterMappingRequest: {
        agent_cluster_id: integration.agent_cluster_id,
        argocd_cluster_url: cluster.argocd_cluster_url,
        cluster_id: response.clusterId,
      },
    })
  }

  const unlinkCluster = (integrationId: string, cluster: ArgoCdLinkedClusterDetails) => {
    setIntegrationsState((current) =>
      current.map((integration) =>
        integration.credentials_id !== integrationId
          ? integration
          : {
              ...integration,
              linked_clusters: integration.linked_clusters.filter(
                ({ qovery_cluster_id }) => qovery_cluster_id !== cluster.qovery_cluster_id
              ),
              unlinked_clusters: [
                ...integration.unlinked_clusters,
                {
                  argocd_cluster_url: cluster.argocd_cluster_url,
                  argocd_cluster_name: cluster.argocd_cluster_name,
                  applications_count: cluster.applications_count,
                },
              ],
            }
      )
    )
  }

  if (integrationsState.length === 0) {
    return (
      <EmptyState
        title="No ArgoCD integration configured"
        description="Add your first ArgoCD instance to automatically visualize linked and unlinked clusters in Qovery."
        icon="link"
        className="h-auto min-h-[146px] w-full max-w-[648px] p-8"
      >
        <Button variant="outline" color="neutral" size="md" className="gap-2" onClick={openCreateModal}>
          <Icon iconName="circle-plus" iconStyle="regular" />
          Add ArgoCD
        </Button>
      </EmptyState>
    )
  }

  return (
    <div className="flex w-full max-w-[648px] flex-col gap-4">
      {integrationsState.map((integration) => (
        <ArgoCdIntegrationCard
          key={integration.credentials_id}
          integration={integration}
          linkedClusterIds={integration.linked_clusters.map(({ qovery_cluster_id }) => qovery_cluster_id)}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onLinkCluster={linkCluster}
          onUnlinkCluster={unlinkCluster}
        />
      ))}
    </div>
  )
}

export function SettingsArgoCdIntegration() {
  const { organizationId = '' } = useParams({ strict: false })

  useDocumentTitle('ArgoCD integration - Organization settings')

  return (
    <div className="w-full">
      <Section className="px-8 pb-8 pt-6">
        <div className="flex justify-between gap-2">
          <SettingsHeading
            title="ArgoCD integration"
            description="Connect your ArgoCD instances to discover and monitor its applications directly in Qovery."
            showNeedHelp={false}
          />
          <Suspense fallback={null}>
            <SettingsArgoCdIntegrationCreateButton organizationId={organizationId} />
          </Suspense>
        </div>

        <div className="max-w-content-with-navigation-left">
          <Suspense
            fallback={
              <div className="flex w-full max-w-[648px] flex-col gap-4">
                <ArgoCdIntegrationCardSkeleton />
              </div>
            }
          >
            <SettingsArgoCdIntegrationContent organizationId={organizationId} />
          </Suspense>
        </div>
      </Section>
    </div>
  )
}
