import { useNavigate } from '@tanstack/react-router'
import { type Environment } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent, useMemo } from 'react'
import { IconEnum } from '@qovery/shared/enums'
import {
  Badge,
  Button,
  CopyToClipboard,
  ExternalLink,
  Heading,
  Icon,
  Link,
  Section,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { buildGitProviderUrl } from '@qovery/shared/util-git'
import { ArgoCdServiceActions } from '../argocd-service-actions/argocd-service-actions'
import { useArgoCdServices } from '../hooks/use-argocd-services/use-argocd-services'

const { Table } = TablePrimitives

const tableGridLayoutClassName =
  'grid w-full grid-cols-[minmax(280px,1.7fr)_minmax(220px,1fr)_minmax(280px,1.1fr)_minmax(112px,112px)]'

export interface ArgoCdServiceListProps {
  environment: Environment
}

export function ArgoCdServiceList({ environment }: ArgoCdServiceListProps) {
  const navigate = useNavigate()
  const environmentId = environment.id
  const organizationId = environment.organization.id
  const projectId = environment.project.id
  const { data: services = [] } = useArgoCdServices({
    environmentId,
    suspense: true,
  })

  const syncedServicesCount = useMemo(
    () => services.filter(({ last_synced_at }) => Boolean(last_synced_at)).length,
    [services]
  )

  if (services.length === 0) {
    return null
  }

  const handleNavigateToService = (serviceId: string) => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
      params: { organizationId, projectId, environmentId, serviceId },
    })
  }

  const stopRowNavigation = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    event.stopPropagation()
  }

  return (
    <Section className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1">
        <Heading level={3} className="font-medium text-neutral-subtle">
          ArgoCD services
        </Heading>
        <p className="text-sm text-neutral-subtle">
          Services managed by ArgoCD, they cannot be deployed or modified through Qovery.
        </p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-lg border border-neutral">
        <div className="flex gap-1.5 bg-surface-neutral px-4 py-3">
          <Badge variant="surface" radius="full" color="green" className="text-ssm font-medium">
            {syncedServicesCount} synced
          </Badge>
        </div>
        <Table.Root
          containerClassName="rounded-none border-t border-x-0 border-b-0"
          className="w-full min-w-[1080px] overflow-x-scroll overflow-y-scroll text-xs xl:overflow-auto"
        >
          <Table.Header className="border-t-none rounded-none border-neutral">
            <Table.Row className={`h-9 w-full ${tableGridLayoutClassName}`}>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Service
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Last operation
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Target version
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center justify-center text-neutral-subtle">
                Actions
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {services.map((service) => {
              const gitRepository = service.git_repository
              const manifestRevision = service.manifest_revision

              return (
                <Table.Row
                  key={service.id}
                  className={`h-[60px] w-full cursor-pointer hover:bg-surface-neutral-subtle ${tableGridLayoutClassName}`}
                  tabIndex={0}
                  onClick={() => handleNavigateToService(service.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleNavigateToService(service.id)
                  }}
                >
                  <Table.Cell className="flex h-full items-center border-r border-neutral">
                    <div className="flex min-w-0 items-center gap-3 text-sm font-medium">
                      <Icon name={IconEnum.ARGOCD} width={20} />
                      <Link
                        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
                        params={{
                          organizationId,
                          projectId,
                          environmentId,
                          serviceId: service.id,
                        }}
                        onClick={stopRowNavigation}
                        onKeyDown={stopRowNavigation}
                        className="group min-w-0"
                      >
                        <Tooltip content={service.name}>
                          <span className="block min-w-0 truncate text-neutral group-hover:underline">
                            {service.name}
                          </span>
                        </Tooltip>
                      </Link>
                    </div>
                  </Table.Cell>

                  <Table.Cell className="flex h-full items-center border-r border-neutral">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon iconName="link" iconStyle="regular" className="text-neutral" />
                      {service.last_synced_at ? (
                        <span className="flex gap-2 text-neutral">
                          Synced
                          <span className="text-neutral-subtle">{timeAgo(new Date(service.last_synced_at))} ago</span>
                        </span>
                      ) : (
                        <span className="text-neutral-subtle">Never synced</span>
                      )}
                    </div>
                  </Table.Cell>

                  <Table.Cell className="flex h-full items-center border-r border-neutral">
                    <div className="flex min-w-0 flex-col gap-0.5 text-ssm">
                      {gitRepository && (
                        <div className="flex min-w-0 items-center gap-2 text-neutral">
                          <Icon className="h-3 w-3 shrink-0 text-inherit" name={gitRepository.provider} />
                          <ExternalLink
                            href={gitRepository.url}
                            underline
                            color="neutral"
                            size="ssm"
                            withIcon={false}
                            className="min-w-0 flex-1 overflow-hidden font-normal"
                            onClick={stopRowNavigation}
                            onKeyDown={stopRowNavigation}
                          >
                            <span className="min-w-0 truncate" title={gitRepository.name}>
                              {gitRepository.name}
                            </span>
                          </ExternalLink>
                        </div>
                      )}
                      {gitRepository?.branch && gitRepository.url ? (
                        <div className="flex min-w-0 items-center gap-2 text-neutral-subtle">
                          <Icon className="h-3 w-3 shrink-0 text-inherit" iconName="code-branch" iconStyle="regular" />
                          <ExternalLink
                            href={buildGitProviderUrl(gitRepository.url, gitRepository.branch)}
                            underline
                            color="neutral"
                            size="ssm"
                            withIcon={false}
                            className="min-w-0 flex-1 overflow-hidden font-normal"
                            onClick={stopRowNavigation}
                            onKeyDown={stopRowNavigation}
                          >
                            <span className="min-w-0 truncate" title={gitRepository.branch}>
                              {gitRepository.branch}
                            </span>
                          </ExternalLink>
                        </div>
                      ) : null}
                    </div>
                    {manifestRevision && (
                      <CopyToClipboard text={manifestRevision} className="ml-auto shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          color="neutral"
                          size="xs"
                          className="pl-1"
                          onClick={stopRowNavigation}
                          onKeyDown={stopRowNavigation}
                        >
                          <Icon iconName="code-commit" className="w-4" />
                          {manifestRevision.substring(0, 7)}
                        </Button>
                      </CopyToClipboard>
                    )}
                  </Table.Cell>

                  <Table.Cell className="flex h-full items-center justify-center">
                    <ArgoCdServiceActions
                      environment={environment}
                      serviceId={service.id}
                      serviceName={service.name}
                      onAction={stopRowNavigation}
                    />
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </div>
    </Section>
  )
}

export default ArgoCdServiceList
