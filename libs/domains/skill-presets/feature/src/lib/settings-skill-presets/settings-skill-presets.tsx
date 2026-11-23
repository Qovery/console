import { useNavigate, useParams } from '@tanstack/react-router'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import {
  type SkillPresetResponse,
  type SkillPresetRevisionResponse,
  getSkillPresetErrorStatus,
} from '@qovery/domains/skill-presets/data-access'
import {
  Avatar,
  Badge,
  Button,
  DropdownMenu,
  EmptyState,
  Icon,
  Skeleton,
  TableFilter,
  TablePrimitives,
  Tooltip,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useDeleteSkillPreset } from '../hooks/use-delete-skill-preset/use-delete-skill-preset'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPresetRevisions } from '../hooks/use-skill-preset-revisions/use-skill-preset-revisions'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { LoadError } from '../load-error/load-error'
import { SkillPresetsLayout } from '../skill-presets-layout/skill-presets-layout'
import { PresetPreviewPanel } from '../skill-presets-preview/preset-preview-panel'
import { baseLabel } from '../utils/qovery-skills'
import { isTemplate } from '../utils/resolve-preset'
import { AssignmentChips } from './assignment-chips'

const { Table } = TablePrimitives

const EMPTY_PRESETS: SkillPresetResponse[] = []
const columns: ColumnDef<SkillPresetResponse>[] = [
  { accessorKey: 'name', header: 'Preset', sortingFn: 'alphanumeric', sortDescFirst: false },
  {
    id: 'base',
    accessorFn: (preset) => baseLabel(preset.base),
    header: 'Starts from',
    enableSorting: false,
    filterFn: (row, id, values: string[]) => !values?.length || values.includes(row.getValue(id)),
  },
  { id: 'assignments', header: 'Assigned to', enableSorting: false },
  {
    id: 'updated_at',
    accessorFn: (preset) => new Date(preset.updated_at).getTime(),
    header: 'Last edited',
    sortingFn: 'basic',
    sortDescFirst: true,
  },
  { id: 'actions', header: () => <span className="sr-only">Actions</span>, enableSorting: false },
]

function ListSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-md border border-neutral p-4"
      aria-busy="true"
      aria-label="Loading presets"
    >
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex items-center gap-6">
          <Skeleton width={200} height={14} show />
          <Skeleton width={90} height={14} show />
          <Skeleton width={220} height={14} show />
          <Skeleton width={120} height={14} show />
        </div>
      ))}
    </div>
  )
}

function PresetRow({
  preset,
  lastRevision,
  organizationId,
  assignees,
  onDelete,
  onPreview,
}: {
  preset: SkillPresetResponse
  lastRevision?: SkillPresetRevisionResponse
  organizationId: string
  assignees: ReturnType<typeof useSkillPresetAssignees>['data']
  onPreview: (preset: SkillPresetResponse) => void
  onDelete: (preset: SkillPresetResponse) => void
}) {
  const navigate = useNavigate()
  const editedAt = lastRevision?.edited_at ?? preset.updated_at
  const editedBy = lastRevision?.edited_by ?? preset.creator_name ?? 'Unknown'
  // Revisions name the editor by email: show the member's name, the email in a tooltip, like Audit logs.
  const editor = assignees?.members.find(({ email }) => email === editedBy)
  const template = isTemplate(preset)
  const openPreset = () =>
    navigate({
      to: '/organization/$organizationId/agent-experience/skill-presets/$skillPresetId',
      params: { organizationId, skillPresetId: preset.id },
    })

  return (
    <Table.Row
      data-testid={`skill-preset-${preset.id}`}
      className="cursor-pointer hover:bg-surface-neutral-subtle"
      tabIndex={0}
      onClick={openPreset}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && event.key === 'Enter') openPreset()
      }}
    >
      <Table.Cell className="h-auto py-3">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="font-medium text-neutral">{preset.name}</span>
            {preset.description && (
              <Tooltip content={preset.description}>
                <span
                  tabIndex={0}
                  aria-label={`Description of ${preset.name}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
                </span>
              </Tooltip>
            )}
            {template && (
              <Badge variant="surface" size="base" className="font-medium">
                Template
              </Badge>
            )}
          </span>
        </div>
      </Table.Cell>
      <Table.Cell className="whitespace-nowrap">{baseLabel(preset.base)}</Table.Cell>
      <Table.Cell className="h-auto py-3">
        {template ? (
          <span className="text-neutral-subtle">Templates are not assigned</span>
        ) : (
          <AssignmentChips assignedTo={preset.assigned_to} assignees={assignees} />
        )}
      </Table.Cell>
      <Table.Cell className="h-auto py-3">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Tooltip content={editor ? `${editor.name} (${editor.email})` : editedBy}>
            <span tabIndex={0} aria-label={editor?.name ?? editedBy} onClick={(event) => event.stopPropagation()}>
              <Avatar
                size="sm"
                src={editor?.profile_picture_url}
                alt={editor?.name ?? editedBy}
                fallback={
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-neutral-component text-xs">
                    {(editor?.name ?? editedBy)
                      .split(' ')
                      .map((part) => part.charAt(0))
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </span>
                }
              />
            </span>
          </Tooltip>
          <div className="flex flex-col">
            <span>{editor?.name ?? editedBy}</span>
            <time className="text-xs text-neutral-subtle" dateTime={editedAt} title={dateFullFormat(editedAt)}>
              {timeAgo(new Date(editedAt))} ago
            </time>
          </div>
        </div>
      </Table.Cell>
      <Table.Cell className="text-right" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button size="md" variant="outline" color="neutral" iconOnly aria-label={`Actions for ${preset.name}`}>
              <Icon iconName="ellipsis-v" iconStyle="regular" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item icon={<Icon iconName="eye" iconStyle="regular" />} onSelect={() => onPreview(preset)}>
              Preview
            </DropdownMenu.Item>
            <DropdownMenu.Item
              icon={<Icon iconName="pen" iconStyle="regular" />}
              onSelect={() =>
                navigate({
                  to: '/organization/$organizationId/agent-experience/skill-presets/$skillPresetId',
                  params: { organizationId, skillPresetId: preset.id },
                })
              }
            >
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              icon={<Icon iconName="clock-rotate-left" iconStyle="regular" />}
              onSelect={() =>
                navigate({
                  to: '/organization/$organizationId/agent-experience/skill-presets/$skillPresetId/history',
                  params: { organizationId, skillPresetId: preset.id },
                })
              }
            >
              History
            </DropdownMenu.Item>
            <DropdownMenu.Item
              icon={<Icon iconName="copy" iconStyle="regular" />}
              onSelect={() =>
                navigate({
                  to: '/organization/$organizationId/agent-experience/skill-presets/new',
                  params: { organizationId },
                  search: { from: preset.id },
                })
              }
            >
              Duplicate
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              color="red"
              icon={<Icon iconName="trash-can" iconStyle="regular" />}
              onSelect={() => onDelete(preset)}
            >
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Table.Cell>
    </Table.Row>
  )
}

function PresetsContent({ organizationId }: { organizationId: string }) {
  const [previewPreset, setPreviewPreset] = useState<SkillPresetResponse | null>(null)
  const navigate = useNavigate()
  // Saving presets as templates is not offered: templates come from Qovery, by profile.
  const { data: presets, isLoading, error, refetch } = useSkillPresets({ organizationId, isTemplate: false })
  const { data: assignees } = useSkillPresetAssignees({ organizationId })
  // One request for the whole list: the organization's latest revisions, newest first. It is capped, so a
  // preset left untouched while many others changed is missing: its row falls back to the preset itself.
  const { data: revisions } = useSkillPresetRevisions({ organizationId })
  const lastRevisions = useMemo(() => {
    const latest = new Map<string, SkillPresetRevisionResponse>()
    revisions?.forEach((revision) => {
      if (!latest.has(revision.skill_preset_id)) latest.set(revision.skill_preset_id, revision)
    })
    return latest
  }, [revisions])
  const { mutateAsync: deleteSkillPreset } = useDeleteSkillPreset()
  const { openModalConfirmation } = useModalConfirmation()

  const table = useReactTable({
    data: presets ?? EMPTY_PRESETS,
    columns,
    initialState: { sorting: [{ id: 'updated_at', desc: true }] },
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  if (isLoading) return <ListSkeleton />

  if (error && getSkillPresetErrorStatus(error) !== 403) {
    return (
      <LoadError
        title="The Skills registry could not be loaded"
        error={error}
        onRetry={() => refetch()}
        note="Your members’ agents keep working with the preset they last loaded."
      />
    )
  }

  const all = presets ?? []
  if (all.length === 0) {
    return (
      <EmptyState
        icon="wand-magic-sparkles"
        title="No presets yet"
        description="A preset decides which Qovery skills your members’ agents load, adds your team’s instructions and your own skills, and applies to the whole organization, a role or specific members. Until you create one, agents use the Qovery skills as published."
      >
        <div className="flex gap-2">
          <Button
            size="md"
            onClick={() =>
              navigate({
                to: '/organization/$organizationId/agent-experience/skill-presets/new',
                params: { organizationId },
              })
            }
          >
            <Icon iconName="grid-2" iconStyle="regular" />
            Start from a template
          </Button>
          <Button
            size="md"
            variant="outline"
            color="neutral"
            onClick={() =>
              navigate({
                to: '/organization/$organizationId/agent-experience/skill-presets/new',
                params: { organizationId },
                search: { template: 'blank' },
              })
            }
          >
            Blank preset
          </Button>
        </div>
      </EmptyState>
    )
  }

  const onDelete = (preset: SkillPresetResponse) =>
    openModalConfirmation({
      title: 'Delete preset',
      name: preset.name,
      confirmationMethod: 'name',
      description: `Members who receive ${preset.name} fall back to their role’s preset, the organization default, or the Qovery skills as published. Its history stays in the audit logs.`,
      action: async () => {
        await deleteSkillPreset({ organizationId, skillPresetId: preset.id })
      },
    })

  return (
    <div className="flex flex-col gap-2">
      {previewPreset && (
        <PresetPreviewPanel
          preset={previewPreset}
          open
          onOpenChange={(open) => {
            if (!open) setPreviewPreset(null)
          }}
        />
      )}
      <Table.Root>
        <Table.Header className="[&_th]:whitespace-nowrap [&_th]:text-xs [&_th]:font-medium">
          {table.getHeaderGroups().map((group) => (
            <Table.Row key={group.id}>
              {group.headers.map((header) => (
                <Table.ColumnHeaderCell
                  key={header.id}
                  className="group"
                  aria-sort={
                    header.column.getCanSort()
                      ? match(header.column.getIsSorted())
                          .with('asc', () => 'ascending' as const)
                          .with('desc', () => 'descending' as const)
                          .otherwise(() => 'none' as const)
                      : undefined
                  }
                >
                  {header.column.id === 'base' ? (
                    <TableFilter column={header.column} />
                  ) : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="flex cursor-pointer select-none items-center gap-1"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {match(header.column.getIsSorted())
                        .with('asc', () => <Icon className="text-xs" iconName="arrow-down" />)
                        .with('desc', () => <Icon className="text-xs" iconName="arrow-up" />)
                        .with(false, () => (
                          <Icon
                            className="text-xs opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
                            iconName="arrow-down-arrow-up"
                          />
                        ))
                        .exhaustive()}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map(({ original: preset }) => (
            <PresetRow
              key={preset.id}
              preset={preset}
              lastRevision={lastRevisions.get(preset.id)}
              organizationId={organizationId}
              assignees={assignees}
              onDelete={onDelete}
              onPreview={setPreviewPreset}
            />
          ))}
        </Table.Body>
      </Table.Root>
      <p className="text-xs text-neutral-subtle">
        A member gets the preset assigned to them, otherwise their role’s, otherwise the organization default.
      </p>
    </div>
  )
}

export function SettingsSkillPresets() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('Skills registry - Agents')

  return (
    <SkillPresetsLayout activeTab="presets">
      <PresetsContent organizationId={organizationId} />
    </SkillPresetsLayout>
  )
}
