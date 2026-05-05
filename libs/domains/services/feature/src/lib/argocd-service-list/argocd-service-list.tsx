import { type ArgocdAppResponse, type Environment } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { IconEnum } from '@qovery/shared/enums'
import { Badge, ExternalLink, Heading, Icon, Section, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { useArgoCdServices } from '../hooks/use-argocd-services/use-argocd-services'

const { Table } = TablePrimitives

const tableGridLayoutClassName = 'grid w-full grid-cols-[minmax(280px,1.7fr)_minmax(220px,1fr)_minmax(280px,1.1fr)]'

export interface ArgoCdServiceListProps {
  environment: Environment
}

const getRepositoryLabel = (service: ArgocdAppResponse) => {
  if (!service.source_repo_url) {
    return null
  }

  try {
    const url = new URL(service.source_repo_url)
    return `${url.hostname}${url.pathname}`
  } catch {
    return service.source_repo_url
  }
}

export function ArgoCdServiceList({ environment }: ArgoCdServiceListProps) {
  const { data: services = [] } = useArgoCdServices({
    environmentId: environment.id,
    suspense: true,
  })

  const syncedServicesCount = useMemo(
    () => services.filter(({ last_synced_at }) => Boolean(last_synced_at)).length,
    [services]
  )

  if (services.length === 0) {
    return null
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
              <Table.ColumnHeaderCell className="flex h-full items-center text-neutral-subtle">
                Target version
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {services.map((service) => {
              const repositoryLabel = getRepositoryLabel(service)

              return (
                <Table.Row key={service.id} className={`h-[60px] w-full ${tableGridLayoutClassName}`}>
                  <Table.Cell className="flex h-full items-center border-r border-neutral">
                    <div className="flex min-w-0 items-center gap-3 text-sm font-medium">
                      <Icon name={IconEnum.ARGOCD} width={20} />
                      <div className="flex min-w-0 flex-col">
                        <Tooltip content={service.name}>
                          <span className="truncate">{service.name}</span>
                        </Tooltip>
                      </div>
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

                  <Table.Cell className="flex h-full items-center">
                    <div className="flex min-w-0 flex-col gap-0.5 text-ssm">
                      {repositoryLabel ? (
                        <div className="flex min-w-0 items-center gap-2 text-neutral">
                          <Icon className="h-3 w-3 shrink-0 text-inherit" iconName="code-branch" iconStyle="regular" />
                          <ExternalLink
                            href={service.source_repo_url ?? '#'}
                            underline
                            color="neutral"
                            size="ssm"
                            withIcon={false}
                            className="min-w-0 flex-1 overflow-hidden font-normal"
                          >
                            <span className="min-w-0 truncate" title={repositoryLabel}>
                              {repositoryLabel}
                            </span>
                          </ExternalLink>
                        </div>
                      ) : null}
                    </div>
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
