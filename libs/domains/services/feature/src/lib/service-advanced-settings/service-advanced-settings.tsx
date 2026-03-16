import { useParams } from '@tanstack/react-router'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import clsx from 'clsx'
import {
  type ApplicationAdvancedSettings,
  type ContainerAdvancedSettings,
  type HelmAdvancedSettings,
  type JobAdvancedSettings,
} from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  type AnyService,
  type Database,
  type AdvancedSettings as _AdvancedSettings,
} from '@qovery/domains/services/data-access'
import {
  CopyToClipboardButtonIcon,
  Icon,
  InputToggle,
  LoaderSpinner,
  StickyActionFormToaster,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { generateAdvancedSettingDocUrl, objectFlattener, twMerge } from '@qovery/shared/util-js'
import { useAdvancedSettings } from '../hooks/use-advanced-settings/use-advanced-settings'
import { useDefaultAdvancedSettings } from '../hooks/use-default-advanced-settings/use-default-advanced-settings'
import { useEditAdvancedSettings } from '../hooks/use-edit-advanced-settings/use-edit-advanced-settings'
import { useService } from '../hooks/use-service/use-service'

const { Table } = TablePrimitives

function formatValue(value: unknown) {
  return (typeof value === 'object' ? JSON.stringify(value) : value?.toString()) || ''
}

interface Entry {
  name: string
  defaultValue: string
  value: string
}

type AdvancedSettingsData =
  | { advancedSettings: ApplicationAdvancedSettings; defaultAdvancedSettings: ApplicationAdvancedSettings }
  | { advancedSettings: ContainerAdvancedSettings; defaultAdvancedSettings: ContainerAdvancedSettings }
  | { advancedSettings: JobAdvancedSettings; defaultAdvancedSettings: JobAdvancedSettings }
  | { advancedSettings: HelmAdvancedSettings; defaultAdvancedSettings: HelmAdvancedSettings }

export type AdvancedSettingsProps = {
  service: Exclude<AnyService, Database>
} & (AdvancedSettingsData | { advancedSettings?: never; defaultAdvancedSettings?: never })

export function AdvancedSettings({
  service,
  advancedSettings: advancedSettingsProp,
  defaultAdvancedSettings: defaultAdvancedSettingsProp,
}: AdvancedSettingsProps) {
  const { organizationId = '', projectId = '' } = useParams({
    strict: false,
  })
  const {
    id: serviceId,
    serviceType,
    environment: { id: environmentId },
  } = service

  const { data: advancedSettingsFetched } =
    useAdvancedSettings({
      serviceId,
      serviceType,
      suspense: true,
    }) ?? {}
  const { data: defaultAdvancedSettingsFetched } =
    useDefaultAdvancedSettings({
      serviceType,
      suspense: true,
    }) ?? {}

  const advancedSettings = advancedSettingsProp ?? advancedSettingsFetched
  const defaultAdvancedSettings = defaultAdvancedSettingsProp ?? defaultAdvancedSettingsFetched

  const [overriddenOnly, setOverriddenOnly] = useState(false)
  const { control, handleSubmit, formState, reset } = useForm<Record<string, string>>({
    mode: 'onChange',
    defaultValues: {
      ...(advancedSettings
        ? Object.entries(advancedSettings).reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = formatValue(value)
            return acc
          }, {})
        : {}),
    },
  })
  const isDirty = Boolean(Object.keys(formState.dirtyFields).length)

  const { mutate: editAdvancedSettings, isLoading: isEditAdvancedSettings } = useEditAdvancedSettings({
    organizationId: organizationId ?? '',
    projectId: projectId ?? '',
    environmentId,
  })

  const data: Entry[] = useMemo(() => {
    const entries: Entry[] = []
    if (!advancedSettings || !defaultAdvancedSettings) return []
    for (const [k1, v1] of Object.entries(advancedSettings)) {
      for (const [k2, v2] of Object.entries(defaultAdvancedSettings)) {
        if (k1 === k2) {
          entries.push({ name: k1, defaultValue: v2, value: v1 })
        }
      }
    }
    return entries.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
  }, [advancedSettings, defaultAdvancedSettings])

  const onSubmit = handleSubmit((data: Record<string, string>) => {
    let dataFormatted = { ...data }
    Object.keys(dataFormatted).forEach((key) => {
      if (key.includes('.')) delete dataFormatted[key]
    })
    dataFormatted = objectFlattener(dataFormatted)
    Object.keys(dataFormatted).forEach((key) => {
      try {
        JSON.parse(dataFormatted[key])
      } catch {
        if (dataFormatted[key] === '') {
          dataFormatted[key] = defaultAdvancedSettings ? defaultAdvancedSettings[key as keyof _AdvancedSettings] : ''
        }
        return
      }
      dataFormatted[key] = JSON.parse(dataFormatted[key])
    })
    editAdvancedSettings({ serviceId, payload: { serviceType, ...dataFormatted } })
  })

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Entry>()
    return [
      columnHelper.accessor('name', {
        header: 'Settings',
        cell(info) {
          const name = info.getValue()
          return (
            <Tooltip classNameTrigger="px-4 truncate font-medium" content={name}>
              <a
                href={generateAdvancedSettingDocUrl(name, 'service')}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate hover:underline"
              >
                {name}
              </a>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor('defaultValue', {
        header: 'Default Value',
        cell(info) {
          const defaultValue = formatValue(info.getValue())
          return (
            <div className="flex px-4">
              <Tooltip classNameTrigger="truncate" content={defaultValue}>
                <div>{defaultValue}</div>
              </Tooltip>
              <CopyToClipboardButtonIcon
                className="invisible ml-2 text-neutral-subtle group-hover:visible"
                content={defaultValue}
              />
            </div>
          )
        },
      }),
      columnHelper.accessor('value', {
        header: 'Value',
        cell(info) {
          const { name, defaultValue } = info.row.original
          return (
            <div className="px-1">
              <Controller
                name={name}
                control={control}
                rules={{
                  required: defaultValue === null || defaultValue === '' ? false : 'Please enter a value.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex gap-3">
                    {error?.message && (
                      <Tooltip content={error.message} align="center" side="top">
                        <div data-testid="warning-icon-left" className="flex items-center">
                          <Icon iconName="triangle-exclamation" className="block text-sm text-warning" />
                        </div>
                      </Tooltip>
                    )}
                    <textarea
                      rows={1}
                      className={twMerge(
                        clsx(
                          'min-h-[34px] w-full appearance-none rounded border border-neutral bg-transparent px-3 py-1.5 pr-3 text-sm text-neutral outline-0 hover:border-brand-component focus:border-brand-component focus:outline focus:outline-[3px] focus:outline-surface-brand-subtle',
                          {
                            'border-negative-component hover:border-surface-negative-solid focus:border-surface-negative-solid focus:outline-1 focus:outline-surface-negative-subtle':
                              Boolean(error?.message),
                          }
                        )
                      )}
                      name={field.name}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </div>
                )}
              />
            </div>
          )
        },
      }),
    ]
  }, [control])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  if (!advancedSettings || !defaultAdvancedSettings) {
    return null
  }

  return (
    <>
      <InputToggle
        small
        className="mb-6"
        dataTestId="show-overriden-only-toggle"
        value={overriddenOnly}
        onChange={setOverriddenOnly}
        title="Show only overridden settings"
      />
      <form onSubmit={onSubmit}>
        <div className="relative">
          <div className="overflow-hidden rounded">
            <Table.Root className="w-full table-fixed text-sm">
              <Table.Header className="text-xs">
                {table.getHeaderGroups().map((headerGroup) => (
                  <Table.Row key={headerGroup.id} className="divide-x divide-neutral">
                    {headerGroup.headers.map((header) => (
                      <Table.ColumnHeaderCell className="font-medium" key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Table.ColumnHeaderCell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Header>
              <Table.Body>
                {table.getRowModel().rows.map((row) => {
                  const isSameAsDefault = formatValue(row.original.defaultValue) === formatValue(row.original.value)
                  const isHidden = overriddenOnly && isSameAsDefault
                  return (
                    <Table.Row
                      key={row.id}
                      className={`divide-x divide-neutral hover:bg-surface-neutral-subtle ${isHidden ? 'hidden' : ''}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Table.Cell key={cell.id} className="group h-10 px-0">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </div>
          <StickyActionFormToaster
            visible={isDirty}
            onSubmit={onSubmit}
            onReset={reset}
            disabledValidation={!formState.isValid}
            loading={isEditAdvancedSettings}
          />
        </div>
      </form>
    </>
  )
}

export function ServiceAdvancedSettings() {
  const { environmentId = '', serviceId = '' } = useParams({
    strict: false,
  })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })

  if (!service) return null
  if (service.serviceType === 'DATABASE') {
    return <p className="text-sm text-neutral-subtle">No advanced settings available for this service.</p>
  }

  return <AdvancedSettings service={service as Exclude<AnyService, Database>} />
}

export function ServiceAdvancedSettingsLoader() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <LoaderSpinner className="w-6" />
    </div>
  )
}

export default ServiceAdvancedSettings
