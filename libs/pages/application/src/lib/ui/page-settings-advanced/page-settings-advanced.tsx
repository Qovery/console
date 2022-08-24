import { ApplicationAdvancedSettings } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { LoadingStatus } from '@console/shared/interfaces'
import {
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  IconAwesomeEnum,
  InputTextSmall,
  LoaderSpinner,
  Tooltip,
} from '@console/shared/ui'

export interface PageSettingsAdvancedProps {
  keys?: string[]
  defaultAdvancedSettings?: ApplicationAdvancedSettings
  advancedSettings?: ApplicationAdvancedSettings
  loading: LoadingStatus
  onSubmit?: () => void
  discardChanges: () => void
}

export function PageSettingsAdvanced(props: PageSettingsAdvancedProps) {
  const { control, formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full overflow-auto">
      <div className="p-8 ">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Advanced Settings</h1>
            <p className="text-sm text-text-500 max-w-content-with-navigation-left">
              Settings are injected at the build and run time of your application and thus any change on this section
              will be applied on the next manual/automatic deploy.
            </p>
          </div>
        </div>

        <form onSubmit={props.onSubmit}>
          <div className="relative">
            {(!props.loading || props.loading === 'loading') && props.keys?.length === 0 ? (
              <div className="flex justify-center">
                <LoaderSpinner className="w-6"></LoaderSpinner>
              </div>
            ) : (
              <div className="border border-solid border-element-light-lighter-400 rounded">
                <div className={`flex h-10 border-solid border-element-light-lighter-400 border-t-0 border-b`}>
                  <div className="flex-[3] border-element-light-lighter-400 border-solid border-r text-sm font-medium text-text-500 items-center flex px-4 py-2">
                    Settings
                  </div>
                  <div className="flex-[1] border-element-light-lighter-400 border-solid font-medium border-r min-w-0 flex items-center text-text-500 px-4 text-ssm">
                    Default Value
                  </div>

                  <div className="flex-[4] flex items-center px-1 font-medium text-sm text-text-500">
                    <span className="px-3">Value</span>
                  </div>
                </div>
                {props.keys?.map((key, index) => (
                  <div
                    className={`flex h-10 border-solid border-element-light-lighter-400 hover:bg-element-light-lighter-200 ${
                      props.keys && props.keys.length - 1 !== index ? 'border-b' : ''
                    }`}
                    key={key}
                  >
                    <div className="flex-[3] border-element-light-lighter-400 border-solid border-r text-sm font-medium text-text-500 items-center flex px-4 py-2">
                      {key}
                    </div>
                    <div className="flex-[1] border-element-light-lighter-400 border-solid border-r min-w-0 flex items-center text-text-500 px-4 text-ssm">
                      <Tooltip
                        content={
                          (props.defaultAdvancedSettings &&
                            props.defaultAdvancedSettings[key as keyof ApplicationAdvancedSettings]?.toString()) ||
                          ''
                        }
                      >
                        <div className="inline whitespace-nowrap overflow-hidden text-ellipsis">
                          {props.defaultAdvancedSettings &&
                            props.defaultAdvancedSettings[key as keyof ApplicationAdvancedSettings]?.toString()}
                        </div>
                      </Tooltip>
                    </div>

                    <div className="flex-[4] flex items-center px-1">
                      <Controller
                        name={key}
                        control={control}
                        rules={{
                          required: 'Please enter a value.',
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
                          />
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div
              className={`mt-10 p-4 float-right inline-flex justify-center gap-4  sticky bottom-10 bg-white mx-auto rounded shadow ${
                formState.isDirty ? 'visible' : 'hidden'
              }`}
            >
              <Button
                size={ButtonSize.XLARGE}
                style={ButtonStyle.STROKED}
                onClick={() => {
                  props.discardChanges()
                }}
                iconLeft={IconAwesomeEnum.CROSS}
              >
                Discard Changes
              </Button>
              <Button size={ButtonSize.XLARGE} style={ButtonStyle.BASIC} type="submit">
                Save Changes
              </Button>
            </div>
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
