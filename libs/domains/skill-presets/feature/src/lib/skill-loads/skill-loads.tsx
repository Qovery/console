import { Link, useParams } from '@tanstack/react-router'
import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { type SkillLoadChange, getSkillPresetErrorDetail } from '@qovery/domains/skill-presets/data-access'
import { Badge, Callout, EmptyState, Icon, Pagination, Skeleton, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useSkillLoads } from '../hooks/use-skill-loads/use-skill-loads'
import { SkillPresetsLayout } from '../skill-presets-layout/skill-presets-layout'

const { Table } = TablePrimitives

const MODE_LABELS: Record<string, string> = {
  ADD: 'Organization skill',
  OVERLAY: 'Qovery + team instructions',
  REPLACE: 'Replaced',
  DISABLE: 'Disabled',
}

export function parseSkillLoad(event: OrganizationEventResponse): SkillLoadChange | null {
  try {
    return JSON.parse(event.change ?? '') as SkillLoadChange
  } catch {
    return null
  }
}

const tokenFrom = (link?: string, name = 'continueToken') =>
  link ? new URLSearchParams(link.split('?')[1]).get(name) : null

function LoadsContent({ organizationId }: { organizationId: string }) {
  const [pageSize, setPageSize] = useState(30)
  const [cursor, setCursor] = useState<{ continueToken?: string | null; stepBackToken?: string | null }>({})
  const { data, isLoading, isFetching, error } = useSkillLoads({ organizationId, pageSize, ...cursor })

  if (isLoading) return <Skeleton height={320} className="w-full" show />
  if (error) {
    return (
      <Callout.Root color="red" role="alert">
        <Callout.Icon>
          <Icon iconName="circle-exclamation" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextHeading>Skill loads could not be loaded</Callout.TextHeading>
          <Callout.TextDescription>{getSkillPresetErrorDetail(error)}</Callout.TextDescription>
        </Callout.Text>
      </Callout.Root>
    )
  }

  const events = data?.events ?? []
  if (events.length === 0 && !cursor.continueToken && !cursor.stepBackToken) {
    return (
      <EmptyState
        icon="clock-rotate-left"
        title="No skill loads yet"
        description="Every time a member's agent loads a Qovery skill or one of yours, it shows here with the preset and revision it used."
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
          {events.map((event) => {
            const load = parseSkillLoad(event)
            return (
              <Table.Row key={event.id}>
                <Table.Cell className="whitespace-nowrap">
                  {event.timestamp && (
                    <Tooltip content={dateUTCString(event.timestamp)}>
                      <span>{dateFullFormat(event.timestamp, undefined, 'dd MMM, HH:mm')}</span>
                    </Tooltip>
                  )}
                </Table.Cell>
                <Table.Cell className="max-w-[220px] truncate">{event.triggered_by}</Table.Cell>
                <Table.Cell className="h-auto py-2">
                  <span className="flex flex-col">
                    <span className="font-code">{load?.skill_name ?? '-'}</span>
                    <span className="text-xs text-neutral-subtle">
                      {load?.mode ? MODE_LABELS[load.mode] : 'Qovery skill as published'}
                    </span>
                  </span>
                </Table.Cell>
                <Table.Cell>
                  {load?.skill_preset_id ? (
                    <Link
                      to="/organization/$organizationId/settings/skill-presets/$skillPresetId/history"
                      params={{ organizationId, skillPresetId: load.skill_preset_id }}
                      className="text-neutral hover:text-brand"
                    >
                      {load.skill_preset_name} <span className="text-neutral-subtle">rev. {load.revision}</span>
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
        previousDisabled={!data?.links?.previous}
        nextDisabled={!data?.links?.next}
        onPrevious={() => setCursor({ stepBackToken: tokenFrom(data?.links?.previous, 'stepBackToken') })}
        onNext={() => setCursor({ continueToken: tokenFrom(data?.links?.next) })}
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
  useDocumentTitle('Skill loads - Organization settings')
  return (
    <SkillPresetsLayout activeTab="loads">
      <LoadsContent organizationId={organizationId} />
    </SkillPresetsLayout>
  )
}

export default SkillLoads
