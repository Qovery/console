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
  StickyActionFormToaster,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { objectFlattener, twMerge } from '@qovery/shared/util-js'
import { useEditAdvancedSettings } from '../hooks/use-edit-advanced-settings/use-edit-advanced-settings'

const { Table } = TablePrimitives

function formatValue(value: unknown) {
  return (typeof value === 'object' ? JSON.stringify(value) : value?.toString()) || ''
}

interface Entry {
  name: string
  defaultValue: string
  value: string
}

export type AdvancedSettingsProps = {
  service: Exclude<AnyService, Database>
} & (
  | {
      advancedSettings: ApplicationAdvancedSettings
      defaultAdvancedSettings: ApplicationAdvancedSettings
    }
  | {
      advancedSettings: ContainerAdvancedSettings
      defaultAdvancedSettings: ContainerAdvancedSettings
    }
  | {
      advancedSettings: JobAdvancedSettings
      defaultAdvancedSettings: JobAdvancedSettings
    }
  | {
      advancedSettings: HelmAdvancedSettings
      defaultAdvancedSettings: HelmAdvancedSettings
    }
)

export function AdvancedSettings({
  service: {
    id: serviceId,
    serviceType,
    environment: { id: environmentId },
  },
  defaultAdvancedSettings,
  advancedSettings,
}: AdvancedSettingsProps) {
  const [overriddenOnly, setOverriddenOnly] = useState(false)
  const { control, handleSubmit, formState, reset } = useForm<Record<string, string>>({
    mode: 'onChange',
    defaultValues: {
      ...Object.entries(advancedSettings).reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = formatValue(value)
        return acc
      }, {}),
    },
  })
  // https://github.com/react-hook-form/react-hook-form/issues/3213
  const isDirty = Boolean(Object.keys(formState.dirtyFields).length)

  const { mutate: editAdvancedSettings, isLoading: isEditAdvancedSettings } = useEditAdvancedSettings({ environmentId })

  const data: Entry[] = useMemo(() => {
    const entries: Entry[] = []

    if (!advancedSettings || !defaultAdvancedSettings) {
      return []
    }

    for (const [k1, v1] of Object.entries(advancedSettings)) {
      for (const [k2, v2] of Object.entries(defaultAdvancedSettings)) {
        if (k1 === k2) {
          entries.push({
            name: k1,
            defaultValue: v2,
            value: v1,
          })
        }
      }
    }
    return entries.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
  }, [advancedSettings, defaultAdvancedSettings])

  const onSubmit = handleSubmit((data: Record<string, string>) => {
    let dataFormatted = { ...data }

    Object.keys(dataFormatted).forEach((key) => {
      if (key.includes('.')) {
        delete dataFormatted[key]
      }
    })

    dataFormatted = objectFlattener(dataFormatted)

    // below is a hack to handle the weird way the payload behaves
    // empty string must be sent as ''
    // empty numbers must be sent as null
    // the thing is we don't know in advance if the value is a string or a number
    // the interface has this information, but we can't check the type of the property of the interface
    // we can't do ApplicationAdvanceSettings[key] === 'string' or 'number'
    // so if field is empty string replace by value found in defaultSettings (because default value is well typed)
    Object.keys(dataFormatted).forEach((key) => {
      // check if we can convert this string to object
      try {
        JSON.parse(dataFormatted[key])
      } catch (e) {
        if (dataFormatted[key] === '') {
          dataFormatted[key] = defaultAdvancedSettings ? defaultAdvancedSettings[key as keyof _AdvancedSettings] : ''
        }
        return
      }
      dataFormatted[key] = JSON.parse(dataFormatted[key])
    })

    editAdvancedSettings({
      serviceId,
      payload: {
        serviceType,
        ...dataFormatted,
      },
    })
  })

  const columnHelper = createColumnHelper<Entry>()
  const columns = useMemo(() => {
    return [
      columnHelper.accessor('name', {
        header: 'Settings',
        cell(info) {
          const name = info.getValue()

          return (
            <Tooltip classNameTrigger="px-4 truncate font-medium" content={name}>
              <div>{name}</div>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor('defaultValue', {
        header: 'Default Value',
        cell(info) {
          let defaultValue = info.getValue()
          defaultValue = formatValue(defaultValue)
          return (
            <div className="flex px-4">
              <Tooltip classNameTrigger="truncate" content={defaultValue}>
                <div>{defaultValue}</div>
              </Tooltip>
              <CopyToClipboardButtonIcon
                className="invisible ml-2 text-neutral-300 group-hover:visible"
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
                          <Icon iconName="triangle-exclamation" className="block text-sm text-yellow-500" />
                        </div>
                      </Tooltip>
                    )}
                    <textarea
                      rows={1}
                      className={twMerge(
                        clsx(
                          'min-h-[34px] w-full appearance-none rounded border border-neutral-250 bg-transparent px-3 py-1.5 pr-3 text-sm text-neutral-400 outline-0 hover:border-brand-500 focus:border-brand-500 focus:outline focus:outline-[3px] focus:outline-brand-100',
                          {
                            'border-red-500 hover:border-red-500 focus:border-red-500 focus:outline-1 focus:outline-red-500':
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
  }, [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <InputToggle
        small
        className="mb-6"
        value={overriddenOnly}
        onChange={setOverriddenOnly}
        title="Show only overridden settings"
      />

      <form onSubmit={onSubmit}>
        <div className="relative">
          <div className="overflow-hidden rounded border">
            <Table.Root className="w-full table-fixed text-sm">
              <Table.Header>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Table.Row key={headerGroup.id} className="divide-x divide-neutral-200">
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
                      className={`divide-x divide-neutral-200 hover:bg-neutral-100 ${isHidden ? 'hidden' : ''}`}
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

export default AdvancedSettings
