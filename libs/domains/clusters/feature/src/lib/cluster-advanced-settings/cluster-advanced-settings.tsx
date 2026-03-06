import clsx from 'clsx'
import equal from 'fast-deep-equal'
import { type ClusterAdvancedSettings as ClusterAdvancedSettingsType } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import {
  CopyToClipboardButtonIcon,
  Icon,
  InputToggle,
  LoaderSpinner,
  StickyActionFormToaster,
  TableEdition,
  type TableEditionRow,
  Tooltip,
} from '@qovery/shared/ui'
import { generateAdvancedSettingDocUrl, twMerge } from '@qovery/shared/util-js'

export interface ClusterAdvancedSettingsProps {
  onSubmit: () => void
  loading: boolean
  clusterAdvancedSettings?: ClusterAdvancedSettingsType
  defaultAdvancedSettings?: ClusterAdvancedSettingsType
}

export function ClusterAdvancedSettings({
  onSubmit,
  loading,
  clusterAdvancedSettings,
  defaultAdvancedSettings,
}: ClusterAdvancedSettingsProps) {
  const { control, formState, reset } = useFormContext<{ [key: string]: string }>()
  const [showOverriddenOnly, toggleShowOverriddenOnly] = useState(false)

  const keys = useMemo(() => {
    if (clusterAdvancedSettings) {
      return Object.keys(clusterAdvancedSettings).sort()
    }
    return []
  }, [clusterAdvancedSettings])

  const table: TableEditionRow[] = useMemo(() => {
    const tableHeader: TableEditionRow[] = [
      {
        cells: [
          {
            content: 'Settings',
          },
          {
            content: 'Default Value',
          },
          {
            content: <span className="px-3">Value</span>,
            className: '!p-1',
          },
        ],
        className: 'font-medium hover:bg-surface-neutral',
      },
    ]

    const tableBody: TableEditionRow[] = keys
      ? keys.map((key) => {
          return {
            className: `${
              showOverriddenOnly &&
              defaultAdvancedSettings &&
              clusterAdvancedSettings &&
              equal(
                defaultAdvancedSettings[key as keyof ClusterAdvancedSettingsType],
                clusterAdvancedSettings[key as keyof ClusterAdvancedSettingsType]
              )
                ? 'hidden'
                : ''
            }`,
            cells: [
              {
                content: (
                  <Tooltip classNameTrigger="truncate" content={key}>
                    <a
                      href={generateAdvancedSettingDocUrl(key, 'cluster')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate hover:underline"
                    >
                      {key}
                    </a>
                  </Tooltip>
                ),
                className: 'font-medium',
              },
              {
                content: () => {
                  const value =
                    defaultAdvancedSettings && defaultAdvancedSettings[key as keyof ClusterAdvancedSettingsType]
                  const displayValue = (typeof value === 'object' ? JSON.stringify(value) : value?.toString()) || ''

                  return (
                    <>
                      <Tooltip
                        content={
                          (defaultAdvancedSettings &&
                            defaultAdvancedSettings[key as keyof ClusterAdvancedSettingsType]?.toString()) ||
                          ''
                        }
                      >
                        <div className="inline overflow-hidden text-ellipsis whitespace-nowrap">{displayValue}</div>
                      </Tooltip>
                      <CopyToClipboardButtonIcon
                        className="invisible ml-2 text-neutral-subtle group-hover:visible"
                        content={
                          (defaultAdvancedSettings &&
                            defaultAdvancedSettings[key as keyof ClusterAdvancedSettingsType]?.toString()) ||
                          ''
                        }
                      />
                    </>
                  )
                },
                className: 'group',
              },
              {
                className: '!p-1',
                content: (
                  <Controller
                    name={key}
                    control={control}
                    rules={{
                      required:
                        defaultAdvancedSettings &&
                        (defaultAdvancedSettings[key as keyof ClusterAdvancedSettingsType] === null ||
                          defaultAdvancedSettings[key as keyof ClusterAdvancedSettingsType]?.toString().length === 0)
                          ? false
                          : 'Please enter a value.',
                    }}
                    defaultValue=""
                    render={({ field, fieldState: { error } }) => (
                      <div className="flex w-full gap-3">
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
                ),
              },
            ],
          }
        })
      : []

    return [...tableHeader, ...tableBody]
  }, [keys, showOverriddenOnly, defaultAdvancedSettings, clusterAdvancedSettings, control])

  return (
    <>
      <InputToggle
        small
        className="mb-6"
        dataTestId="show-overriden-only-toggle"
        value={showOverriddenOnly}
        onChange={toggleShowOverriddenOnly}
        title="Show only overridden settings"
      />

      <form onSubmit={onSubmit}>
        <div className="relative">
          {loading && keys.length === 0 ? (
            <div className="flex justify-center">
              <LoaderSpinner className="w-6" />
            </div>
          ) : (
            <TableEdition tableBody={table} />
          )}
          <StickyActionFormToaster
            visible={formState.isDirty}
            onSubmit={onSubmit}
            onReset={reset}
            disabledValidation={!formState.isValid}
            loading={loading}
          />
        </div>
      </form>
    </>
  )
}

export default ClusterAdvancedSettings
