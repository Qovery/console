import { Controller, useFormContext } from 'react-hook-form'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { timezoneValues, weekdaysValues } from '@qovery/shared/enums'
import { BlockContent, Button, InputSelect, InputText, InputToggle, Section } from '@qovery/shared/ui'

export interface PageSettingsDeploymentRulesProps {
  onSubmit: () => void
  watchAutoStop: boolean
  loading: boolean
}

export function PageSettingsDeploymentRules(props: PageSettingsDeploymentRulesProps) {
  const { onSubmit, watchAutoStop, loading } = props
  const { control, formState } = useFormContext()

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left  p-8">
        <SettingsHeading title="Deployment rules" />
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
            <Button className="mb-6" type="submit" size="lg" disabled={!formState.isValid} loading={loading}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsDeploymentRules
