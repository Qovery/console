import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { useDeleteOrganizationCustomDomain } from '@qovery/domains/custom-domains/feature'
import { EnvironmentMode } from '@qovery/domains/environments/feature'
import {
  Button,
  Checkbox,
  ExternalLink,
  Icon,
  Link,
  TablePrimitives,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import { getDomainTargets } from '../utils/organization-domain-targets'
import { type DomainDnsStatusResult } from '../utils/summarize-domain-dns-checks'
import { OrganizationDomainEditModal } from './organization-domain-edit-modal'
import { OrganizationDomainStatusCell } from './organization-domain-status'

const { Table } = TablePrimitives

export function OrganizationDomainRow({
  domain,
  selected,
  onSelectionChange,
  selectionDisabled,
  dnsStatus,
  dnsChecking = false,
  onCheckDns,
}: {
  domain: OrganizationCustomDomainResponse
  selected?: boolean
  onSelectionChange?: (selected: boolean) => void
  selectionDisabled?: boolean
  // `undefined` while the DNS checks load.
  dnsStatus?: DomainDnsStatusResult
  dnsChecking?: boolean
  onCheckDns?: () => void
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteDomain, isLoading: isDeleting } = useDeleteOrganizationCustomDomain()
  const { data: environmentMode } = useQuery({
    ...queries.environments.list({ projectId: domain.project.id }),
    select: (environments) => environments?.find(({ id }) => id === domain.environment_id)?.mode,
  })
  const targets = getDomainTargets(domain)

  return (
    <Table.Row className={selected ? 'bg-surface-brand-subtle' : undefined}>
      <Table.Cell className="h-12 border-r font-medium">
        <div className="flex items-center gap-3">
          {onSelectionChange ? (
            <Checkbox
              aria-label={`Select ${domain.domain} in ${domain.environment.name}`}
              className="h-3.5 w-3.5"
              checked={selected}
              disabled={selectionDisabled}
              onCheckedChange={(checked) => onSelectionChange(checked === true)}
            />
          ) : null}
          <span className="min-w-0 truncate" title={domain.domain}>
            {domain.domain}
          </span>
          <Tooltip content={`Open ${domain.domain}`}>
            <ExternalLink
              as="button"
              size="xs"
              variant="outline"
              color="neutral"
              radius="full"
              iconOnly
              href={`https://${domain.domain}`}
              aria-label={`Open ${domain.domain}`}
              className="shrink-0"
            >
              <Icon iconName="link" />
            </ExternalLink>
          </Tooltip>
        </div>
      </Table.Cell>
      <Table.Cell className="h-12 border-r">
        <OrganizationDomainStatusCell result={dnsStatus} checking={dnsChecking} />
      </Table.Cell>
      <Table.Cell className="h-12 border-r">
        <Link
          color="neutral"
          className="min-w-0 max-w-full font-normal"
          title={domain.project.name}
          to="/organization/$organizationId/project/$projectId/overview"
          params={{ organizationId, projectId: domain.project.id }}
        >
          <span className="truncate">{domain.project.name}</span>
        </Link>
      </Table.Cell>
      <Table.Cell className="h-12 border-r">
        <Link
          color="neutral"
          className="min-w-0 max-w-full gap-2 font-normal"
          title={domain.environment.name}
          to="/organization/$organizationId/project/$projectId/environment/$environmentId/overview"
          params={{ organizationId, projectId: domain.project.id, environmentId: domain.environment_id }}
        >
          <span className="flex w-4 shrink-0">
            {environmentMode ? (
              <EnvironmentMode
                mode={environmentMode}
                variant="shrink"
                aria-label={`${environmentMode.toLowerCase()} environment`}
              />
            ) : null}
          </span>
          <span className="truncate">{domain.environment.name}</span>
        </Link>
      </Table.Cell>
      <Table.Cell className="h-12 border-r">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-2">
          {domain.routes.map((route) => (
            <Tooltip
              key={route.id}
              content={`${route.service.name} ${route.path} · Port: ${route.port?.internal_port ?? 'No public port'}${route.path_rewrite === null ? '' : ` · Rewrite: ${route.path_rewrite}`}`}
            >
              <Link
                color="neutral"
                size="xs"
                aria-label={`${route.service.name}: ${route.path}`}
                className="min-w-0 shrink-0 gap-0 overflow-hidden rounded border border-neutral text-xs leading-4 focus-visible:outline-2 focus-visible:outline-brand-strong"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/domain"
                params={{
                  organizationId,
                  projectId: domain.project.id,
                  environmentId: domain.environment_id,
                  serviceId: route.service.id,
                }}
              >
                <span className="flex min-w-0 items-center gap-1 px-1.5 py-[3px]">
                  <Icon name={route.service.type} width="14" height="14" />
                  <span className="max-w-32 truncate">{route.service.name}</span>
                </span>
                <span className="max-w-32 self-stretch truncate border-l border-neutral px-1.5 py-[3px] font-normal text-neutral-subtle">
                  {route.path}
                </span>
              </Link>
            </Tooltip>
          ))}
        </div>
      </Table.Cell>
      <Table.Cell className="h-12">
        <div className="flex justify-end gap-1.5">
          <Tooltip content="Edit domain">
            <Button
              aria-label={`Edit ${domain.domain}`}
              iconOnly
              variant="outline"
              color="neutral"
              size="xs"
              onClick={() =>
                openModal({
                  content: <OrganizationDomainEditModal domain={domain} onClose={closeModal} />,
                  options: { width: 560 },
                })
              }
            >
              <Icon iconName="pencil" />
            </Button>
          </Tooltip>
          <Tooltip content="Check DNS records">
            <Button
              aria-label={`Check DNS for ${domain.domain}`}
              iconOnly
              variant="outline"
              color="neutral"
              size="xs"
              disabled={!onCheckDns || dnsChecking || !targets.length}
              onClick={onCheckDns}
            >
              <Icon iconName="arrow-rotate-right" />
            </Button>
          </Tooltip>
          <Tooltip content="Delete domain">
            <Button
              aria-label={`Delete ${domain.domain}`}
              iconOnly
              variant="outline"
              color="neutral"
              size="xs"
              disabled={isDeleting || !targets.length}
              onClick={() =>
                openModalConfirmation({
                  title: 'Delete custom domain',
                  confirmationMethod: 'action',
                  name: domain.domain,
                  description: `Remove this domain from ${targets.length} service ${pluralize(targets.length, 'configuration')}. Redeploy the affected services to apply the change.`,
                  action: async () => {
                    await deleteDomain({ environmentId: domain.environment_id, domainName: domain.domain })
                  },
                })
              }
            >
              <Icon iconName="trash-can" />
            </Button>
          </Tooltip>
        </div>
      </Table.Cell>
    </Table.Row>
  )
}
