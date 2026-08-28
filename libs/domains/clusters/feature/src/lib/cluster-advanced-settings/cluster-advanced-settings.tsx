import clsx from 'clsx'
import equal from 'fast-deep-equal'
import { type ClusterAdvancedSettings as ClusterAdvancedSettingsType } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form'
import {
  CopyToClipboardButtonIcon,
  Icon,
  InputToggle,
  LoaderSpinner,
  StickyActionFormToaster,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { generateAdvancedSettingDocUrl, twMerge } from '@qovery/shared/util-js'
import {
  buildClusterAdvancedSettingsPayload,
  normalizeClusterAdvancedSettings,
} from './build-cluster-advanced-settings-payload'

export interface ClusterAdvancedSettingsProps {
  onSubmit: () => void
  loading: boolean
  clusterAdvancedSettings?: ClusterAdvancedSettingsType
  defaultAdvancedSettings?: ClusterAdvancedSettingsType
  formBaseline?: ClusterAdvancedSettingsType
}

function formatValue(value: unknown) {
  return (typeof value === 'object' ? JSON.stringify(value) : value?.toString()) || ''
}

const { Table } = TablePrimitives

interface ClusterAdvancedSettingsSaveActionProps {
  onSubmit: () => void
  loading: boolean
  defaultAdvancedSettings?: ClusterAdvancedSettingsType
  formBaseline?: ClusterAdvancedSettingsType
}

function ClusterAdvancedSettingsSaveAction({
  onSubmit,
  loading,
  defaultAdvancedSettings,
  formBaseline,
}: ClusterAdvancedSettingsSaveActionProps) {
  const { control, reset } = useFormContext<{ [key: string]: string }>()
  const { isDirty, isValid } = useFormState({ control })
  const formValues = useWatch({ control })
  const normalizedBaseline = useMemo(
    () =>
      formBaseline === undefined ? undefined : normalizeClusterAdvancedSettings(formBaseline, defaultAdvancedSettings),
    [defaultAdvancedSettings, formBaseline]
  )

  const hasChanged =
    isDirty &&
    normalizedBaseline !== undefined &&
    !equal(
      buildClusterAdvancedSettingsPayload(formValues as Record<string, unknown>, defaultAdvancedSettings),
      normalizedBaseline
    )

  return (
    <StickyActionFormToaster
      visible={hasChanged}
      onSubmit={onSubmit}
      onReset={reset}
      disabledValidation={!isValid}
      loading={loading}
    />
  )
}

export function ClusterAdvancedSettings({
  onSubmit,
  loading,
  clusterAdvancedSettings,
  defaultAdvancedSettings,
  formBaseline,
}: ClusterAdvancedSettingsProps) {
  const { control } = useFormContext<{ [key: string]: string }>()
  const [showOverriddenOnly, toggleShowOverriddenOnly] = useState(false)

  const keys = useMemo(() => {
    if (clusterAdvancedSettings) {
      return Object.keys(clusterAdvancedSettings).sort()
    }
    return []
  }, [clusterAdvancedSettings])

  const tableRows = useMemo(() => {
    return keys.map((key) => {
      const defaultValue = defaultAdvancedSettings?.[key as keyof ClusterAdvancedSettingsType]
      const currentValue = clusterAdvancedSettings?.[key as keyof ClusterAdvancedSettingsType]
      const displayDefaultValue = formatValue(defaultValue)

      const isHidden =
        showOverriddenOnly && defaultAdvancedSettings && clusterAdvancedSettings && equal(defaultValue, currentValue)

      return {
        key,
        defaultValue,
        displayDefaultValue,
        isHidden,
      }
    })
  }, [keys, showOverriddenOnly, defaultAdvancedSettings, clusterAdvancedSettings])

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
            <div className="overflow-hidden rounded">
              <Table.Root className="w-full table-fixed text-sm">
                <Table.Header className="text-xs">
                  <Table.Row className="divide-x divide-neutral">
                    <Table.ColumnHeaderCell className="font-medium">Settings</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="font-medium">Default Value</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="font-medium">Value</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {tableRows.map((row) => (
                    <Table.Row
                      key={row.key}
                      className={`divide-x divide-neutral hover:bg-surface-neutral-subtle ${row.isHidden ? 'hidden' : ''}`}
                    >
                      <Table.Cell className="group h-10 px-0">
                        <Tooltip classNameTrigger="px-4 truncate font-medium" content={row.key}>
                          <a
                            href={generateAdvancedSettingDocUrl(row.key, 'cluster')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate hover:underline"
                          >
                            {row.key}
                          </a>
                        </Tooltip>
                      </Table.Cell>
                      <Table.Cell className="group h-10 px-0">
                        <div className="flex px-4">
                          <Tooltip content={row.displayDefaultValue}>
                            <div className="inline overflow-hidden text-ellipsis whitespace-nowrap">
                              {row.displayDefaultValue}
                            </div>
                          </Tooltip>
                          <CopyToClipboardButtonIcon
                            className="invisible ml-2 text-neutral-subtle group-hover:visible"
                            content={row.defaultValue?.toString() ?? ''}
                          />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="h-10 px-0">
                        <div className="px-1">
                          <Controller
                            name={row.key}
                            control={control}
                            rules={{
                              required:
                                defaultAdvancedSettings &&
                                (defaultAdvancedSettings[row.key as keyof ClusterAdvancedSettingsType] === null ||
                                  defaultAdvancedSettings[row.key as keyof ClusterAdvancedSettingsType]?.toString()
                                    .length === 0)
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
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
          )}
          <ClusterAdvancedSettingsSaveAction
            onSubmit={onSubmit}
            loading={loading}
            defaultAdvancedSettings={defaultAdvancedSettings}
            formBaseline={formBaseline}
          />
        </div>
      </form>
    </>
  )
}

export default ClusterAdvancedSettings
