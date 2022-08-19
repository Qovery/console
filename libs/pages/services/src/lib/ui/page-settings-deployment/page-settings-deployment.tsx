import { Controller, useFormContext } from 'react-hook-form'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  InputSelect,
  InputSelectMultiple,
  InputText,
  InputToggle,
} from '@console/shared/ui'

export interface PageSettingsDeploymentProps {
  onSubmit: () => void
}

export function PageSettingsDeployment(props: PageSettingsDeploymentProps) {
  const { onSubmit } = props
  const { control, formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8  max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="h5 text-text-700 mb-2">Deployment</h2>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <BlockContent title="Global settings">
            <Controller
              name="auto_deploy"
              control={control}
              render={({ field }) => (
                <InputToggle
                  className="mb-5"
                  dataTestId="auto-deploy"
                  value={field.value}
                  onChange={field.onChange}
                  title="Auto-deploy"
                  description="The services from the environment will be automatically updated when they are updated."
                  forceAlignTop
                  small
                />
              )}
            />
            <Controller
              name="auto_delete"
              control={control}
              render={({ field }) => (
                <InputToggle
                  dataTestId="auto-delete"
                  value={field.value}
                  onChange={field.onChange}
                  title="Auto-delete"
                  description="This environment will be automatically when a branch from a related application is merged or deleted."
                  forceAlignTop
                  small
                />
              )}
            />
          </BlockContent>
          <BlockContent title="Setup to apply - Start & stop">
            <div className="flex items-center gap-3">
              <Controller
                name="auto_stop"
                control={control}
                render={({ field }) => (
                  <InputToggle
                    value={field.value}
                    onChange={(e) => {
                      // field.onChange(e)
                      // setAutoStop(e)
                    }}
                    className="mb-5"
                    title="Deploy on specific timeframe"
                    description="Specify a timeframe to automatically start & stop your environment."
                    small
                  />
                )}
              />
            </div>
            <Controller
              name="weekdays"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputSelectMultiple
                  label="Which days"
                  value={field.value}
                  // options={weekdaysSelection}
                  options={[]}
                  error={error?.message}
                  onChange={field.onChange}
                  className="mb-3"
                  // disabled={!autoStop}
                />
              )}
            />
            <Controller
              name="timezone"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  label="Timezone"
                  // items={timezoneSelection}
                  items={[]}
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
                    name={field.name}
                    type="time"
                    onChange={field.onChange}
                    value={field.value}
                    error={error?.message}
                    label="Start time"
                    className="flex-grow"
                    // disabled={!autoStop}
                  />
                )}
              />
              <Controller
                name="stop_time"
                control={control}
                rules={{ required: 'Please enter a stop time.' }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    name={field.name}
                    type="time"
                    onChange={field.onChange}
                    value={field.value}
                    error={error?.message}
                    label="Stop time"
                    className="flex-grow"
                    // disabled={!autoStop}
                  />
                )}
              />
            </div>
          </BlockContent>
          <div className="flex justify-end">
            <Button
              className="mb-6 btn--no-min-w"
              disabled={!formState.isValid}
              size={ButtonSize.LARGE}
              style={ButtonStyle.BASIC}
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

export default PageSettingsDeployment
