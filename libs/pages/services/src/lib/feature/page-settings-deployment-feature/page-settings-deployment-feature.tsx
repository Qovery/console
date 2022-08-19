import { EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  editEnvironmentDeploymentRules,
  environmentsLoadingStatus,
  fetchEnvironmentDeploymentRules,
  selectEnvironmentDeploymentRulesByEnvId,
} from '@console/domains/environment'
import { Value } from '@console/shared/interfaces'
import { dateToHours, weekdaysValues } from '@console/shared/utils'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsDeployment from '../../ui/page-settings-deployment/page-settings-deployment'

export const handleSubmit = (data: FieldValues, environmentDeploymentRules: EnvironmentDeploymentRule) => {
  const cloneEnvironmentDeploymentRules = Object.assign({}, environmentDeploymentRules)
  cloneEnvironmentDeploymentRules.auto_deploy = data['auto_deploy']
  cloneEnvironmentDeploymentRules.auto_delete = data['auto_delete']

  cloneEnvironmentDeploymentRules.auto_stop = data['auto_stop']
  cloneEnvironmentDeploymentRules.weekdays = data['weekdays'].map((day: Value) => day.value)
  cloneEnvironmentDeploymentRules.start_time = `1970-01-01T${data['start_time']}:00.000Z`
  cloneEnvironmentDeploymentRules.stop_time = `1970-01-01T${data['stop_time']}:00.000Z`

  return cloneEnvironmentDeploymentRules
}

export function PageSettingsDeploymentFeature() {
  const { environmentId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const loadingStatusEnvironment = useSelector(environmentsLoadingStatus)

  const environmentDeploymentRules = useSelector<RootState, EnvironmentDeploymentRule | undefined>(
    (state) => selectEnvironmentDeploymentRulesByEnvId(state, environmentId),
    (a, b) => a?.auto_deploy === b?.auto_deploy && a?.auto_delete === b?.auto_delete
  )

  const methods = useForm({
    mode: 'onChange',
  })

  const watchAutoStop = methods.watch('auto_stop')

  useEffect(() => {
    if (loadingStatusEnvironment === 'loaded') dispatch(fetchEnvironmentDeploymentRules(environmentId))
  }, [dispatch, loadingStatusEnvironment, environmentId])

  useEffect(() => {
    const startTime = environmentDeploymentRules?.start_time && dateToHours(environmentDeploymentRules?.start_time)
    const stopTime = environmentDeploymentRules?.stop_time && dateToHours(environmentDeploymentRules?.stop_time)

    methods.setValue('auto_deploy', environmentDeploymentRules?.auto_deploy)
    methods.setValue('auto_delete', environmentDeploymentRules?.auto_delete)
    methods.setValue('auto_stop', environmentDeploymentRules?.auto_stop)
    methods.setValue('timezone', environmentDeploymentRules?.timezone || 'UTC')
    methods.setValue('start_time', startTime)
    methods.setValue('stop_time', stopTime)
    methods.setValue('weekdays', weekdaysValues)
  }, [methods, environmentDeploymentRules])

  const onSubmit = methods.handleSubmit((data) => {
    if (data && environmentDeploymentRules) {
      const cloneEnvironmentDeploymentRules = handleSubmit(data, environmentDeploymentRules)

      dispatch(
        editEnvironmentDeploymentRules({
          environmentId,
          deploymentRuleId: environmentDeploymentRules?.id || '',
          data: cloneEnvironmentDeploymentRules,
        })
      )
    }
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsDeployment onSubmit={onSubmit} watchAutoStop={watchAutoStop} />
    </FormProvider>
  )
}

export default PageSettingsDeploymentFeature
