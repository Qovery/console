import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { APPLICATION_MONITORING_ALERTS_URL, APPLICATION_MONITORING_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { Chart, Heading, Icon, Link, Section, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useAlerts } from '../../hooks/use-alerts/use-alerts'
import { SeverityIndicator } from '../severity-indicator/severity-indicator'

const { Table } = TablePrimitives

export function IssueOverview() {
  const { organizationId = '' } = useParams()
  const { data: alerts = [], isFetched: isAlertsFetched } = useAlerts({ organizationId })
  useDocumentTitle('Issues - Alerting')

  if (!isAlertsFetched)
    return (
      <div className="flex h-full w-full items-center justify-center p-5">
        <Chart.Loader />
      </div>
    )

  return (
    <Section className="w-full px-8 py-6">
      <div className="border-b border-neutral-250">
        <div className="flex w-full items-center justify-between pb-5">
          <Heading level={1}>Issues</Heading>
        </div>
      </div>
      {alerts.length === 0 ? (
        <div className="mt-8 flex h-full flex-col items-center justify-center gap-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 40 40">
            <path stroke="#DBD8E0" d="M.5.5h39v39H.5z"></path>
            <path
              fill="#218358"
              d="M28.717 14.015a.96.96 0 0 1 0 1.361l-10.605 10.61a.96.96 0 0 1-1.362 0l-5.467-5.464a.964.964 0 0 1 1.362-1.362l4.78 4.78 9.926-9.925a.96.96 0 0 1 1.362 0z"
            ></path>
            <path fill="#8E8C99" d="M4 0v1H1v3H0V0zM36 0v1h3v3h1V0zM4 40v-1H1v-3H0v4zM36 40v-1h3v-3h1v4z"></path>
          </svg>
          <div className="flex flex-col justify-center text-center">
            <p className="font-medium">All clear, no issues detected!</p>
            <p className="text-sm text-neutral-350">All monitored services are operating within normal thresholds.</p>
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-md border border-neutral-250">
          <Table.Root className="divide-y divide-neutral-250">
            <Table.Header>
              <Table.Row className="font-code text-xs">
                <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">Alert name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">Target</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">Severity</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">Age</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body className="divide-y divide-neutral-250">
              {alerts?.map((alert) => {
                const isMuted = !alert.enabled

                return (
                  <Table.Row key={alert.id}>
                    <Table.RowHeaderCell>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-sm text-neutral-400">{alert.name}</span>
                        {isMuted && (
                          <Tooltip content="Alert is muted">
                            <Icon iconName="bell-slash" iconStyle="regular" className="text-xs text-neutral-350" />
                          </Tooltip>
                        )}
                      </div>
                    </Table.RowHeaderCell>
                    <Table.Cell className="h-11">
                      <Link
                        as="button"
                        radius="full"
                        variant="surface"
                        color="neutral"
                        size="xs"
                        className="justify-center gap-1.5 pl-0.5"
                        to={
                          APPLICATION_URL(
                            organizationId,
                            alert.target.service?.project_id,
                            alert.target.service?.environment_id,
                            alert.target.service?.id
                          ) +
                          APPLICATION_MONITORING_URL +
                          APPLICATION_MONITORING_ALERTS_URL
                        }
                      >
                        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-white">
                          <Icon
                            name={match(alert.target.target_type)
                              .with('CONTAINER', () => 'APPLICATION')
                              .otherwise((s) => s)}
                            iconStyle="regular"
                            width={13}
                          />
                        </span>
                        {alert.target.service?.name}
                      </Link>
                    </Table.Cell>
                    <Table.Cell className="h-11">
                      <SeverityIndicator severity={alert.severity} />
                    </Table.Cell>
                    <Table.Cell className="h-11">{timeAgo(new Date(alert.updated_at ?? ''))}</Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
        </div>
      )}
    </Section>
  )
}

export default IssueOverview
