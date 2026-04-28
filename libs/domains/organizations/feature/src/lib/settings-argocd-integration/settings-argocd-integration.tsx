import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { useParams } from '@tanstack/react-router'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, Button, EmptyState, Icon, Link, ModalConfirmation, Section, useModal } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import {
  type OrganizationArgoCdClusterType,
  type OrganizationArgoCdIntegration,
  type OrganizationArgoCdLinkedCluster,
  type OrganizationArgoCdUnlinkedCluster,
  useOrganizationArgoCdIntegrations,
} from '../hooks/use-organization-argocd-integrations/use-organization-argocd-integrations'
import { ConnectArgoCdModal } from './connect-argocd-modal/connect-argocd-modal'
import { LinkClusterModal, type LinkClusterModalResponse } from './link-cluster-modal/link-cluster-modal'

interface ArgoCdSectionProps {
  id: 'linked' | 'unlinked'
  title: string
  count: number
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  hasBottomBorder?: boolean
  children?: ReactNode
}

interface ArgoCdIntegrationCardProps {
  integration: OrganizationArgoCdIntegration
  organizationId: string
  linkedClusterIds: string[]
  onEdit: (integration: OrganizationArgoCdIntegration) => void
  onDelete: (integration: OrganizationArgoCdIntegration) => void
  onLinkCluster: (
    integrationId: string,
    cluster: OrganizationArgoCdUnlinkedCluster,
    response: LinkClusterModalResponse
  ) => void
  onUnlinkCluster: (integrationId: string, cluster: OrganizationArgoCdLinkedCluster) => void
}

const getDestinationClusterName = (destinationCluster: string) =>
  destinationCluster.replace(/^https?:\/\//, '').replace(/\/$/, '')

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

function ArgoCdIntegrationCard({
  integration,
  organizationId,
  linkedClusterIds,
  onEdit,
  onDelete,
  onLinkCluster,
  onUnlinkCluster,
}: ArgoCdIntegrationCardProps) {
  const { openModal, closeModal } = useModal()
  const [isLinkedSectionOpen, setIsLinkedSectionOpen] = useState(true)
  const [isUnlinkedSectionOpen, setIsUnlinkedSectionOpen] = useState(false)

  const hasLinkedClusters = integration.linkedClusters.length > 0
  const hasUnlinkedClusters = integration.unlinkedClusters.length > 0

  const openLinkClusterModal = (cluster: OrganizationArgoCdUnlinkedCluster) => {
    openModal({
      content: (
        <LinkClusterModal
          organizationId={organizationId}
          argoCdClusterName={cluster.argocdName ?? getDestinationClusterName(cluster.destinationCluster)}
          linkedClusterIds={linkedClusterIds}
          onClose={(response?: LinkClusterModalResponse) => {
            closeModal()
            if (response) {
              onLinkCluster(integration.id, cluster, response)
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
      data-testid={`argocd-integration-${integration.id}`}
    >
      <div className="relative overflow-hidden rounded-lg border border-neutral bg-surface-neutral shadow-[0px_0px_4px_0px_rgba(0,0,0,0.01),0px_2px_3px_0px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-neutral">ArgoCD running on</span>
            <Link
              to="/organization/$organizationId/cluster/$clusterId/overview"
              params={{ organizationId, clusterId: integration.agentClusterId }}
              className="flex h-6 items-center gap-1 rounded-md border border-neutral bg-surface-neutral px-1.5 text-ssm font-normal text-neutral hover:bg-surface-neutral-subtle hover:text-neutral"
              data-testid="argocd-cluster-link"
            >
              {integration.agentClusterCloudProvider ? (
                <Icon name={integration.agentClusterCloudProvider} width="16" height="16" />
              ) : null}
              {integration.agentClusterName}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              color="neutral"
              iconOnly
              data-testid="edit-argocd-integration"
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
              onClick={() => onDelete(integration)}
            >
              <Icon iconName="trash-can" iconStyle="regular" />
            </Button>
          </div>
        </div>

        {hasLinkedClusters ? (
          <ArgoCdSection
            id="linked"
            title="Linked clusters"
            count={integration.linkedClusters.length}
            isOpen={isLinkedSectionOpen}
            onOpenChange={setIsLinkedSectionOpen}
            hasBottomBorder={hasUnlinkedClusters}
          >
            <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
              {integration.linkedClusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="flex items-center justify-between border-b border-neutral px-4 py-3 last:border-b-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      {cluster.cloudProvider ? <Icon name={cluster.cloudProvider} width="16" height="16" /> : null}
                      <span className="text-ssm font-medium text-neutral">{cluster.clusterName}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-ssm text-neutral-subtle">
                      {cluster.argocdName ? (
                        <span>
                          ArgoCD name: <span className="text-neutral">{cluster.argocdName}</span>
                        </span>
                      ) : null}
                      <span>
                        Cluster type: <span className="text-neutral">{cluster.clusterType}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="md"
                      variant="outline"
                      color="neutral"
                      iconOnly
                      onClick={() => onUnlinkCluster(integration.id, cluster)}
                      data-testid={`unlink-linked-cluster-${cluster.id}`}
                    >
                      <Icon iconName="link-broken" iconStyle="regular" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ArgoCdSection>
        ) : null}

        {hasUnlinkedClusters ? (
          <ArgoCdSection
            id="unlinked"
            title="Unlinked clusters"
            count={integration.unlinkedClusters.length}
            isOpen={isUnlinkedSectionOpen}
            onOpenChange={setIsUnlinkedSectionOpen}
            hasBottomBorder={false}
          >
            <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
              {integration.unlinkedClusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="flex items-center justify-between border-b border-neutral px-4 py-3 last:border-b-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-ssm font-medium text-neutral">
                      {cluster.argocdName ?? getDestinationClusterName(cluster.destinationCluster)}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-ssm text-neutral-subtle">
                      <span>
                        Destination:{' '}
                        <span className="text-neutral">{getDestinationClusterName(cluster.destinationCluster)}</span>
                      </span>
                    </div>
                  </div>
                  <Button
                    size="md"
                    variant="outline"
                    color="neutral"
                    iconOnly
                    onClick={() => openLinkClusterModal(cluster)}
                    data-testid={`link-unlinked-cluster-${cluster.id}`}
                  >
                    <Icon iconName="link" iconStyle="regular" />
                  </Button>
                </div>
              ))}
            </div>
          </ArgoCdSection>
        ) : null}
      </div>

      <div className="-mt-[7px] flex items-center gap-2 rounded-b-lg border border-t-0 border-neutral bg-surface-neutral-subtle px-4 pb-3 pt-[calc(0.75rem+7px)]">
        <Badge size="base" color="green" variant="surface" className="gap-1 font-medium">
          <Icon iconName="circle-check" iconStyle="regular" className="text-xs text-positive" />
          {integration.status === 'connected' ? 'Connected' : 'Unknown'}
        </Badge>
        <p className="text-ssm text-neutral-subtle">
          Last update <span className="text-neutral">{timeAgo(new Date(integration.lastCheckedAt))}</span>
        </p>
      </div>
    </div>
  )
}

const toLinkedCluster = (
  cluster: OrganizationArgoCdUnlinkedCluster,
  response: LinkClusterModalResponse
): OrganizationArgoCdLinkedCluster => ({
  id: `linked-${response.clusterId}`,
  destinationCluster: cluster.destinationCluster,
  clusterId: response.clusterId,
  clusterName: response.clusterName,
  cloudProvider: response.clusterCloudProvider as OrganizationArgoCdIntegration['agentClusterCloudProvider'],
  clusterType: response.clusterType as OrganizationArgoCdClusterType,
  argocdName: cluster.argocdName,
  applicationsCount: cluster.applicationsCount,
})

export function SettingsArgoCdIntegration() {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: integrations = [] } = useOrganizationArgoCdIntegrations({
    organizationId,
  })
  const { openModal, closeModal } = useModal()
  const [integrationsState, setIntegrationsState] = useState<OrganizationArgoCdIntegration[]>([])

  useDocumentTitle('ArgoCD integration - Organization settings')

  useEffect(() => {
    setIntegrationsState(integrations)
  }, [integrations])

  const configuredClusterIds = useMemo(
    () => integrationsState.map(({ agentClusterId }) => agentClusterId),
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

  const openEditModal = (integration: OrganizationArgoCdIntegration) => {
    openModal({
      content: (
        <ConnectArgoCdModal
          organizationId={organizationId}
          configuredClusterIds={configuredClusterIds}
          integration={{
            clusterId: integration.agentClusterId,
            clusterName: integration.agentClusterName,
            clusterCloudProvider: integration.agentClusterCloudProvider,
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
          callback={() => setIntegrationsState((current) => current.filter(({ id }) => id !== integration.id))}
          confirmationMethod="action"
          confirmationAction="delete"
          placeholder={`Enter "delete"`}
          warning="This list is temporarily powered by fake data until the mapping endpoint is available."
        />
      ),
      options: {
        width: 488,
      },
    })
  }

  const linkCluster = (
    integrationId: string,
    cluster: OrganizationArgoCdUnlinkedCluster,
    response: LinkClusterModalResponse
  ) => {
    setIntegrationsState((current) =>
      current.map((integration) =>
        integration.id !== integrationId
          ? integration
          : {
              ...integration,
              linkedClusters: [...integration.linkedClusters, toLinkedCluster(cluster, response)],
              unlinkedClusters: integration.unlinkedClusters.filter(({ id }) => id !== cluster.id),
            }
      )
    )
  }

  const unlinkCluster = (integrationId: string, cluster: OrganizationArgoCdLinkedCluster) => {
    setIntegrationsState((current) =>
      current.map((integration) =>
        integration.id !== integrationId
          ? integration
          : {
              ...integration,
              linkedClusters: integration.linkedClusters.filter(({ id }) => id !== cluster.id),
              unlinkedClusters: [
                ...integration.unlinkedClusters,
                {
                  id: `unlinked-${cluster.id}`,
                  destinationCluster: cluster.destinationCluster,
                  clusterId: null,
                  clusterName: null,
                  cloudProvider: null,
                  clusterType: null,
                  argocdName: cluster.argocdName,
                  applicationsCount: cluster.applicationsCount,
                },
              ],
            }
      )
    )
  }

  return (
    <div className="w-full">
      <Section className="px-8 pb-8 pt-6">
        <div className="relative">
          <SettingsHeading
            title="ArgoCD integration"
            description="Connect your ArgoCD instances to discover and monitor their linked and unlinked clusters directly in Qovery."
            showNeedHelp={false}
          />
          <Button className="absolute right-0 top-0 gap-2" size="md" onClick={openCreateModal}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add ArgoCD
          </Button>
        </div>

        <div className="max-w-content-with-navigation-left">
          {integrationsState.length > 0 ? (
            <div className="flex w-full max-w-[648px] flex-col gap-4">
              {integrationsState.map((integration) => (
                <ArgoCdIntegrationCard
                  key={integration.id}
                  integration={integration}
                  organizationId={organizationId}
                  linkedClusterIds={integration.linkedClusters.map(({ clusterId }) => clusterId)}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onLinkCluster={linkCluster}
                  onUnlinkCluster={unlinkCluster}
                />
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </Section>
    </div>
  )
}
