import clsx from 'clsx'
import equal from 'fast-deep-equal'
import { type ClusterAdvancedSettings } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  CopyToClipboardButtonIcon,
  Icon,
  InputToggle,
  LoaderSpinner,
  Section,
  StickyActionFormToaster,
  TableEdition,
  type TableEditionRow,
  Tooltip,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export interface PageSettingsAdvancedProps {
  keys?: string[]
  defaultAdvancedSettings?: ClusterAdvancedSettings
  advancedSettings?: ClusterAdvancedSettings
  loading: boolean
  onSubmit?: () => void
  discardChanges: () => void
}

export function PageSettingsAdvanced(props: PageSettingsAdvancedProps) {
  const { control, formState } = useFormContext()
  const [showOverriddenOnly, toggleShowOverriddenOnly] = useState(false)

  let table: TableEditionRow[] = [
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
      className: 'font-medium hover:bg-white',
    },
  ]

  const tableBody: TableEditionRow[] = props.keys
    ? props.keys?.map((key) => {
        return {
          className: `${
            showOverriddenOnly &&
            props.defaultAdvancedSettings &&
            props.advancedSettings &&
            equal(
              props.defaultAdvancedSettings[key as keyof ClusterAdvancedSettings],
              props.advancedSettings[key as keyof ClusterAdvancedSettings]
            )
              ? 'hidden'
              : ''
          }`,
          cells: [
            {
              content: (
                <Tooltip classNameTrigger="truncate" content={key}>
                  <div>{key}</div>
                </Tooltip>
              ),
              className: 'font-medium',
            },
            {
              content: () => {
                const value =
                  props.defaultAdvancedSettings && props.defaultAdvancedSettings[key as keyof ClusterAdvancedSettings]
                const displayValue = (typeof value === 'object' ? JSON.stringify(value) : value?.toString()) || ''

                return (
                  <>
                    <Tooltip
                      content={
                        (props.defaultAdvancedSettings &&
                          props.defaultAdvancedSettings[key as keyof ClusterAdvancedSettings]?.toString()) ||
                        ''
                      }
                    >
                      <div className="inline overflow-hidden text-ellipsis whitespace-nowrap">{displayValue}</div>
                    </Tooltip>
                    <CopyToClipboardButtonIcon
                      className="invisible ml-2 text-neutral-300 group-hover:visible"
                      content={
                        (props.defaultAdvancedSettings &&
                          props.defaultAdvancedSettings[key as keyof ClusterAdvancedSettings]?.toString()) ||
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
                      props.defaultAdvancedSettings &&
                      (props.defaultAdvancedSettings[key as keyof ClusterAdvancedSettings] === null ||
                        props.defaultAdvancedSettings[key as keyof ClusterAdvancedSettings]?.toString().length === 0)
                        ? false
                        : 'Please enter a value.',
                  }}
                  defaultValue=""
                  render={({ field, fieldState: { error } }) => (
                    <div className="flex w-full gap-3">
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
                            'min-h-[34px] w-full appearance-none rounded border border-neutral-250  bg-transparent px-3 py-1.5 pr-3 text-sm text-neutral-400 outline-0 hover:border-brand-500 focus:border-brand-500 focus:outline focus:outline-[3px] focus:outline-brand-100',
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
              ),
            },
          ],
        }
      })
    : []

  table = [...table, ...tableBody]

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="p-8">
        <SettingsHeading
          title="Advanced Settings"
          description="Any change to this section will be applied after triggering a cluster update."
        />

        <InputToggle
          small
          className="mb-6"
          dataTestId="show-overriden-only-toggle"
          value={showOverriddenOnly}
          onChange={toggleShowOverriddenOnly}
          title="Show only overridden settings"
        />

        <form onSubmit={props.onSubmit}>
          <div className="relative">
            {props.loading && props.keys?.length === 0 ? (
              <div className="flex justify-center">
                <LoaderSpinner className="w-6" />
              </div>
            ) : (
              <TableEdition tableBody={table} />
            )}
            <StickyActionFormToaster
              visible={formState.isDirty}
              onSubmit={props.onSubmit}
              onReset={props.discardChanges}
              disabledValidation={!formState.isValid}
              loading={props.loading}
            />
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsAdvanced
