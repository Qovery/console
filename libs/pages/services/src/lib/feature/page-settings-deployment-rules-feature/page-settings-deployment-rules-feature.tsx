import { EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useEditEnvironmentDeploymentRule, useFetchEnvironmentDeploymentRule } from '@qovery/domains/environment'
import { dateToHours } from '@qovery/shared/utils'
import PageSettingsDeployment from '../../ui/page-settings-deployment-rules/page-settings-deployment-rules'

export const handleSubmit = (data: FieldValues, environmentDeploymentRules?: EnvironmentDeploymentRule) => {
  const cloneEnvironmentDeploymentRules = Object.assign({}, environmentDeploymentRules)
  cloneEnvironmentDeploymentRules.auto_deploy = data['auto_deploy']
  cloneEnvironmentDeploymentRules.auto_delete = data['auto_delete']

  cloneEnvironmentDeploymentRules.auto_stop = data['auto_stop']
  cloneEnvironmentDeploymentRules.weekdays = data['weekdays']
  cloneEnvironmentDeploymentRules.start_time = `1970-01-01T${data['start_time']}:00.000Z`
  cloneEnvironmentDeploymentRules.stop_time = `1970-01-01T${data['stop_time']}:00.000Z`

  return cloneEnvironmentDeploymentRules
}

export function PageSettingsDeploymentRulesFeature() {
  const { projectId = '', environmentId = '' } = useParams()
  const [loading, setLoading] = useState(false)

  const { data: environmentDeploymentRules } = useFetchEnvironmentDeploymentRule(projectId, environmentId)
  const editEnvironmentDeploymentRule = useEditEnvironmentDeploymentRule(projectId, environmentId, () =>
    setLoading(false)
  )

  const methods = useForm({
    mode: 'onChange',
  })

  const watchAutoStop = methods.watch('auto_stop')

  useEffect(() => {
    const startTime = environmentDeploymentRules?.start_time && dateToHours(environmentDeploymentRules?.start_time)
    const stopTime = environmentDeploymentRules?.stop_time && dateToHours(environmentDeploymentRules?.stop_time)

    methods.setValue('auto_deploy', environmentDeploymentRules?.auto_deploy)
    methods.setValue('auto_delete', environmentDeploymentRules?.auto_delete)
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

      editEnvironmentDeploymentRule.mutate({
        environmentId,
        deploymentRuleId: environmentDeploymentRules?.id || '',
        data: cloneEnvironmentDeploymentRules,
      })
    }
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsDeployment onSubmit={onSubmit} watchAutoStop={watchAutoStop} loading={loading} />
    </FormProvider>
  )
}

export default PageSettingsDeploymentRulesFeature
