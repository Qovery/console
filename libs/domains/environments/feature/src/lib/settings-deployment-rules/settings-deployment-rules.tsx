import { useParams } from '@tanstack/react-router'
import { type EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Controller, type FieldValues, useForm } from 'react-hook-form'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { timezoneValues, weekdaysValues } from '@qovery/shared/enums'
import { BlockContent, Button, Heading, InputSelect, InputText, InputToggle, Section } from '@qovery/shared/ui'
import { dateToHours } from '@qovery/shared/util-dates'
import { useDeploymentRule } from '../hooks/use-deployment-rule/use-deployment-rule'
import { useEditDeploymentRule } from '../hooks/use-edit-deployment-rule/use-edit-deployment-rule'

export const handleSubmit = (data: FieldValues, environmentDeploymentRules?: EnvironmentDeploymentRule) => {
  const cloneEnvironmentDeploymentRules = Object.assign({}, environmentDeploymentRules)
  cloneEnvironmentDeploymentRules.auto_stop = data['auto_stop']
  cloneEnvironmentDeploymentRules.weekdays = data['weekdays']
  cloneEnvironmentDeploymentRules.start_time = `1970-01-01T${data['start_time']}:00.000Z`
  cloneEnvironmentDeploymentRules.stop_time = `1970-01-01T${data['stop_time']}:00.000Z`

  return cloneEnvironmentDeploymentRules
}

export const SettingsDeploymentRules = () => {
  const { environmentId = '' } = useParams({ strict: false })
  const [loading, setLoading] = useState(false)

  const { data: environmentDeploymentRules } = useDeploymentRule({ environmentId })
  const { mutateAsync: editEnvironmentDeploymentRule } = useEditDeploymentRule()

  const methods = useForm({
    mode: 'onChange',
  })

  const watchAutoStop = methods.watch('auto_stop')

  useEffect(() => {
    const startTime = environmentDeploymentRules?.start_time && dateToHours(environmentDeploymentRules?.start_time)
    const stopTime = environmentDeploymentRules?.stop_time && dateToHours(environmentDeploymentRules?.stop_time)

    methods.setValue('auto_stop', environmentDeploymentRules?.auto_stop)
    methods.setValue('timezone', environmentDeploymentRules?.timezone || 'UTC')
    methods.setValue('start_time', startTime)
    methods.setValue('stop_time', stopTime)
    methods.setValue('weekdays', environmentDeploymentRules?.weekdays)
  }, [methods, environmentDeploymentRules])

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data && environmentDeploymentRules) {
      setLoading(true)
      const cloneEnvironmentDeploymentRules = handleSubmit(data, environmentDeploymentRules)

      await editEnvironmentDeploymentRule({
        environmentId,
        deploymentRuleId: environmentDeploymentRules?.id || '',
        payload: cloneEnvironmentDeploymentRules,
      })
      setLoading(false)
    }
  })

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left  p-8">
        <div className="mb-8 flex w-full justify-between gap-2 border-b border-neutral">
          <div className="flex w-full items-start justify-between gap-4 pb-6">
            <div className="flex flex-col gap-2">
              <Heading>Deployment rules</Heading>
              <NeedHelp className="mt-2" />
            </div>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <BlockContent title="Start & stop">
            <div className="flex items-center gap-3">
              <Controller
                name="auto_stop"
                control={methods.control}
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
                  control={methods.control}
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
                  control={methods.control}
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
                    control={methods.control}
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
                    control={methods.control}
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
            <Button className="mb-6" type="submit" size="lg" disabled={!methods.formState.isValid} loading={loading}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}
