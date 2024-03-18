import { type EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useDeploymentRule, useEditDeploymentRule } from '@qovery/domains/environments/feature'
import { dateToHours } from '@qovery/shared/util-dates'
import PageSettingsDeployment from '../../ui/page-settings-deployment-rules/page-settings-deployment-rules'

export const handleSubmit = (data: FieldValues, environmentDeploymentRules?: EnvironmentDeploymentRule) => {
  const cloneEnvironmentDeploymentRules = Object.assign({}, environmentDeploymentRules)
  cloneEnvironmentDeploymentRules.auto_stop = data['auto_stop']
  cloneEnvironmentDeploymentRules.weekdays = data['weekdays']
  cloneEnvironmentDeploymentRules.start_time = `1970-01-01T${data['start_time']}:00.000Z`
  cloneEnvironmentDeploymentRules.stop_time = `1970-01-01T${data['stop_time']}:00.000Z`

  return cloneEnvironmentDeploymentRules
}

export function PageSettingsDeploymentRulesFeature() {
  const { environmentId = '' } = useParams()
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
    <FormProvider {...methods}>
      <PageSettingsDeployment onSubmit={onSubmit} watchAutoStop={watchAutoStop} loading={loading} />
    </FormProvider>
  )
}

export default PageSettingsDeploymentRulesFeature
