import { useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useDeleteCustomDomain } from '@qovery/domains/custom-domains/feature'
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
import { queries } from '@qovery/state/util-queries'
import { getDomainTargets } from '../utils/organization-domain-targets'
import { OrganizationDomainCreateModal } from './organization-domain-create-modal'

const { Table } = TablePrimitives

export function OrganizationDomainRow({
  domain,
  selected,
  onSelectionChange,
  selectionDisabled,
}: {
  domain: OrganizationCustomDomainResponse
  selected?: boolean
  onSelectionChange?: (selected: boolean) => void
  selectionDisabled?: boolean
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteDomain, isLoading: isDeleting } = useDeleteCustomDomain()
  const queryClient = useQueryClient()
  const [checking, setChecking] = useState(false)
  const [dnsResult, setDnsResult] = useState('Check DNS records')
  const targets = getDomainTargets(domain)

  const checkDns = async () => {
    setChecking(true)
    try {
      const results = await Promise.all(
        targets.map(({ service }) =>
          queryClient.fetchQuery({
            ...queries.services.checkCustomDomains({ serviceId: service.id, serviceType: service.type }),
            staleTime: 0,
          })
        )
      )
      const checks = results.flatMap((items) => items ?? []).filter((item) => item.domain_name === domain.domain)
      setDnsResult(
        checks.length
          ? checks.map((item) => item.error_details || 'DNS records are valid').join('\n')
          : 'DNS check returned no result for this domain.'
      )
    } catch {
      setDnsResult('Unable to check DNS records. Try again.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <Table.Row className={selected ? 'bg-surface-brand-subtle' : undefined}>
      <Table.Cell className="h-12 border-r font-medium">
        <div className="flex items-center gap-3">
          {onSelectionChange ? (
            <Checkbox
              aria-label={`Select ${domain.domain} in ${domain.environment.name}`}
              checked={selected}
              disabled={selectionDisabled}
              onCheckedChange={(checked) => onSelectionChange(checked === true)}
            />
          ) : null}
          {domain.domain}
          <ExternalLink href={`https://${domain.domain}`} aria-label={`Open ${domain.domain}`}>
            <Icon iconName="link" />
          </ExternalLink>
        </div>
      </Table.Cell>
      <Table.Cell className="border-r">
        <Link
          to="/organization/$organizationId/project/$projectId/overview"
          params={{ organizationId, projectId: domain.project.id }}
        >
          {domain.project.name}
        </Link>
      </Table.Cell>
      <Table.Cell className="border-r">
        <Link
          to="/organization/$organizationId/project/$projectId/environment/$environmentId/overview"
          params={{ organizationId, projectId: domain.project.id, environmentId: domain.environment_id }}
        >
          {domain.environment.name}
        </Link>
      </Table.Cell>
      <Table.Cell className="border-r">
        <div className="flex flex-wrap gap-2 py-2">
          {domain.routes.map((route) => (
            <Tooltip
              key={route.id}
              content={`Port: ${route.port?.internal_port ?? 'No public port'}${route.path_rewrite === null ? '' : ` · Rewrite: ${route.path_rewrite}`}`}
            >
              <Link
                className="inline-flex items-center rounded border border-neutral text-xs"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/domain"
                params={{
                  organizationId,
                  projectId: domain.project.id,
                  environmentId: domain.environment_id,
                  serviceId: route.service.id,
                }}
              >
                <span className="flex items-center gap-1 px-1.5 py-1">
                  <Icon iconName="cube" iconStyle="regular" />
                  {route.service.name}
                </span>
                <span className="border-l border-neutral px-1.5 py-1 font-code text-neutral-subtle">{route.path}</span>
              </Link>
            </Tooltip>
          ))}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="flex justify-end gap-1.5">
          <Button
            aria-label={`Edit ${domain.domain}`}
            iconOnly
            variant="outline"
            color="neutral"
            size="xs"
            onClick={() =>
              openModal({
                content: <OrganizationDomainCreateModal domain={domain} onClose={closeModal} />,
                options: { width: 488 },
              })
            }
          >
            <Icon iconName="pencil" />
          </Button>
          <Tooltip content={dnsResult}>
            <Button
              aria-label={`Check DNS for ${domain.domain}`}
              iconOnly
              variant="outline"
              color="neutral"
              size="xs"
              disabled={checking || !targets.length}
              onClick={checkDns}
            >
              <Icon iconName="arrow-rotate-right" />
            </Button>
          </Tooltip>
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
                description: `Remove this domain from ${targets.length} service configuration(s). Redeploy the affected services to apply the change.`,
                action: async () =>
                  Promise.all(
                    targets.map((target) =>
                      deleteDomain({
                        serviceId: target.service.id,
                        serviceType: target.service.type,
                        customDomainId: target.custom_domain_id,
                      })
                    )
                  ).then(() => undefined),
              })
            }
          >
            <Icon iconName="trash" />
          </Button>
          <span role="status" className="sr-only">
            {dnsResult}
          </span>
        </div>
      </Table.Cell>
    </Table.Row>
  )
}
