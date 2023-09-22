import { Controller, useFormContext } from 'react-hook-form'
import { timezoneValues, weekdaysValues } from '@qovery/shared/enums'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  InputSelect,
  InputText,
  InputToggle,
} from '@qovery/shared/ui'

export interface PageSettingsDeploymentRulesProps {
  onSubmit: () => void
  watchAutoStop: boolean
  loading: boolean
}

export function PageSettingsDeploymentRules(props: PageSettingsDeploymentRulesProps) {
  const { onSubmit, watchAutoStop, loading } = props
  const { control, formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8  max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="h5 text-neutral-400 mb-2">Deployment rules</h2>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <BlockContent title="Start & stop">
            <div className="flex items-center gap-3">
              <Controller
                name="auto_stop"
                control={control}
                render={({ field }) => (
                  <InputToggle
                    dataTestId="auto-stop"
                    value={field.value}
                    onChange={field.onChange}
                    title="Deploy on specific timeframe"
                    description="Your environment will be automatically started and stopped on a specific timeframe."
                    forceAlignTop
                    small
                  />
                )}
              />
            </div>
            {watchAutoStop && (
              <>
                <Controller
                  name="weekdays"
                  control={control}
                  rules={{ required: 'Please enter minimum one day.' }}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelect
                      dataTestId="weekdays"
                      label="Which days"
                      value={field.value}
                      options={weekdaysValues}
                      error={error?.message}
                      onChange={field.onChange}
                      className="mb-3 mt-5"
                      isMulti={true}
                    />
                  )}
                />
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelect
                      dataTestId="timezone"
                      label="Timezone"
                      options={timezoneValues}
                      onChange={field.onChange}
                      value={field.value}
                      error={error?.message}
                      className="mb-3"
                      disabled
                    />
                  )}
                />
                <div className="flex w-full gap-3">
                  <Controller
                    name="start_time"
                    control={control}
                    rules={{ required: 'Please enter a start time.' }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        dataTestId="start-time"
                        name={field.name}
                        type="time"
                        onChange={field.onChange}
                        value={field.value}
                        error={error?.message}
                        label="Start time"
                        className="flex-grow"
                      />
                    )}
                  />
                  <Controller
                    name="stop_time"
                    control={control}
                    rules={{ required: 'Please enter a stop time.' }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        dataTestId="stop-time"
                        name={field.name}
                        type="time"
                        onChange={field.onChange}
                        value={field.value}
                        error={error?.message}
                        label="Stop time"
                        className="flex-grow"
                      />
                    )}
                  />
                </div>
              </>
            )}
          </BlockContent>
          <div className="flex justify-end">
            <Button
              className="mb-6 btn--no-min-w"
              disabled={!formState.isValid}
              size={ButtonSize.LARGE}
              style={ButtonStyle.BASIC}
              loading={loading}
              type="submit"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/#edit-environment-general-settings',
            linkLabel: 'How to set your deployment',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsDeploymentRules
