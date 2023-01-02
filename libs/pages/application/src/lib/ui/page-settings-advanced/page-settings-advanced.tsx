import { ApplicationAdvancedSettings, JobAdvancedSettings } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { AdvancedSettings, LoadingStatus } from '@qovery/shared/interfaces'
import {
  CopyToClipboard,
  HelpSection,
  InputTextSmall,
  InputToggle,
  LoaderSpinner,
  StickyActionFormToaster,
  TableEdition,
  TableEditionRow,
  Tooltip,
} from '@qovery/shared/ui'

export interface PageSettingsAdvancedProps {
  keys?: string[]
  defaultAdvancedSettings?: AdvancedSettings
  advancedSettings?: AdvancedSettings
  loading: LoadingStatus
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
            props.defaultAdvancedSettings[
              key as keyof (ApplicationAdvancedSettings | JobAdvancedSettings)
            ]?.toString() ===
              props.advancedSettings[key as keyof (ApplicationAdvancedSettings | JobAdvancedSettings)]?.toString()
              ? 'hidden'
              : ''
          }`,
          cells: [
            {
              content: (
                <Tooltip content={key}>
                  <div>{key}</div>
                </Tooltip>
              ),
              className: 'font-medium vis',
            },
            {
              content: (
                <>
                  <Tooltip
                    content={
                      (props.defaultAdvancedSettings &&
                        props.defaultAdvancedSettings[
                          key as keyof (ApplicationAdvancedSettings | JobAdvancedSettings)
                        ]?.toString()) ||
                      ''
                    }
                  >
                    <div className="inline whitespace-nowrap overflow-hidden text-ellipsis">
                      {props.defaultAdvancedSettings &&
                        props.defaultAdvancedSettings[
                          key as keyof (ApplicationAdvancedSettings | JobAdvancedSettings)
                        ]?.toString()}
                    </div>
                  </Tooltip>
                  <CopyToClipboard
                    className="ml-2 text-text-300 invisible group-hover:visible"
                    content={
                      (props.defaultAdvancedSettings &&
                        props.defaultAdvancedSettings[
                          key as keyof (ApplicationAdvancedSettings | JobAdvancedSettings)
                        ]?.toString()) ||
                      ''
                    }
                  />
                </>
              ),
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
                      (props.defaultAdvancedSettings[
                        key as keyof (ApplicationAdvancedSettings | JobAdvancedSettings)
                      ] === null ||
                        props.defaultAdvancedSettings[
                          key as keyof (ApplicationAdvancedSettings | JobAdvancedSettings)
                        ]?.toString().length === 0)
                        ? false
                        : 'Please enter a value.',
                  }}
                  defaultValue=""
                  render={({ field, fieldState: { error } }) => (
                    <InputTextSmall
                      className="shrink-0 grow flex-1"
                      data-testid="value"
                      name={field.name}
                      onChange={field.onChange}
                      value={field.value}
                      error={error?.message}
                      errorMessagePosition="left"
                      label={field.name}
                    />
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
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 ">
        <div className="flex justify-between mb-4">
          <div>
            <h1 className="h5 text-text-700 mb-2">Advanced Settings</h1>
            <p className="text-sm text-text-500 max-w-content-with-navigation-left">
              Settings are injected at the build and run time of your application and thus any change on this section
              will be applied on the next manual/automatic deploy.
            </p>
          </div>
        </div>

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
            {(!props.loading || props.loading === 'loading') && props.keys?.length === 0 ? (
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
              loading={props.loading === 'loading'}
            />
          </div>
        </form>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/advanced-settings/',
            linkLabel: 'How to configure my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsAdvanced
