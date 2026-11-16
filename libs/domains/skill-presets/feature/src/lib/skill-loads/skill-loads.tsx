import { Link, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { Badge, EmptyState, Icon, Pagination, Skeleton, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useSkillLoads } from '../hooks/use-skill-loads/use-skill-loads'
import { LoadError } from '../load-error/load-error'
import { SkillPresetsLayout } from '../skill-presets-layout/skill-presets-layout'

const { Table } = TablePrimitives

const MODE_LABELS: Record<string, string> = {
  ADD: 'Organization skill',
  OVERLAY: 'Qovery + team instructions',
  REPLACE: 'Replaced',
  DISABLE: 'Disabled',
}

function LoadsContent({ organizationId }: { organizationId: string }) {
  const [pageSize, setPageSize] = useState(30)
  const [cursor, setCursor] = useState<{ continueToken?: string | null; stepBackToken?: string | null }>({})
  const { data, isLoading, isFetching, error, refetch } = useSkillLoads({ organizationId, pageSize, ...cursor })

  if (isLoading) return <Skeleton height={320} className="w-full" show />
  if (error) {
    return <LoadError title="Skill loads could not be loaded" error={error} onRetry={() => refetch()} />
  }

  const rows = data?.rows ?? []
  if (rows.length === 0 && !cursor.continueToken && !cursor.stepBackToken) {
    return (
      <EmptyState
        icon="clock-rotate-left"
        title="No skill loads yet"
        description="Every time a member’s agent loads a Qovery skill or one of yours, it shows here with the preset and revision it used."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-neutral-subtle">
        Each row is one skill an agent loaded. These entries are also in the{' '}
        <Link
          to="/organization/$organizationId/audit-logs"
          params={{ organizationId }}
          className="text-brand hover:underline"
        >
          audit logs
        </Link>
        , with the SHA-256 of what was injected.
      </p>
      <Table.Root className={isFetching ? 'opacity-60' : undefined} aria-busy={isFetching}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>When</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Skill</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Preset</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Delivered</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map(({ event, load }) => {
            return (
              <Table.Row key={event.id}>
                <Table.Cell className="whitespace-nowrap">
                  {event.timestamp && (
                    <Tooltip content={dateUTCString(event.timestamp)}>
                      <span tabIndex={0}>{dateFullFormat(event.timestamp, undefined, 'dd MMM, HH:mm')}</span>
                    </Tooltip>
                  )}
                </Table.Cell>
                <Table.Cell className="max-w-[220px] truncate">{event.triggered_by}</Table.Cell>
                <Table.Cell className="h-auto py-2">
                  <span className="flex flex-col">
                    <span className="font-code">{load?.skill_name ?? 'Unreadable entry'}</span>
                    <span className="text-xs text-neutral-subtle">
                      {load?.mode ? MODE_LABELS[load.mode] : 'Qovery skill as published'}
                    </span>
                  </span>
                </Table.Cell>
                <Table.Cell>
                  {load?.skill_preset_id ? (
                    <Link
                      to="/organization/$organizationId/agent-experience/skill-presets/$skillPresetId/history"
                      params={{ organizationId, skillPresetId: load.skill_preset_id }}
                      className="text-neutral hover:text-brand"
                    >
                      {load.skill_preset_name} <span className="text-neutral-subtle">revision {load.revision}</span>
                    </Link>
                  ) : (
                    <span className="text-neutral-subtle">No preset</span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {load?.from_cache ? (
                    <Badge variant="surface" className="gap-1">
                      <Icon iconName="box-archive" iconStyle="regular" aria-hidden="true" />
                      From cache
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Icon iconName="arrow-down-to-line" iconStyle="regular" aria-hidden="true" />
                      Fetched
                    </Badge>
                  )}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
      <Pagination
        previousDisabled={!data?.previousToken}
        nextDisabled={!data?.nextToken}
        onPrevious={() => setCursor({ stepBackToken: data?.previousToken })}
        onNext={() => setCursor({ continueToken: data?.nextToken })}
        pageSize={String(pageSize)}
        onPageSizeChange={(value) => {
          setPageSize(Number(value))
          setCursor({})
        }}
      />
    </div>
  )
}

export function SkillLoads() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('Skill loads - Agents')
  return (
    <SkillPresetsLayout activeTab="loads">
      <LoadsContent organizationId={organizationId} />
    </SkillPresetsLayout>
  )
}
