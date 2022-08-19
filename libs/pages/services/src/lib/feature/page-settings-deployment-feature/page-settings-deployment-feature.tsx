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
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsDeployment from '../../ui/page-settings-deployment/page-settings-deployment'

export const handleSubmit = (data: FieldValues, environmentDeploymentRules: EnvironmentDeploymentRule) => {
  const cloneEnvironmentDeploymentRules = Object.assign({}, environmentDeploymentRules)
  cloneEnvironmentDeploymentRules.auto_deploy = data['auto_deploy']
  cloneEnvironmentDeploymentRules.auto_delete = data['auto_delete']

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

  useEffect(() => {
    if (loadingStatusEnvironment === 'loaded') dispatch(fetchEnvironmentDeploymentRules(environmentId))
  }, [dispatch, loadingStatusEnvironment, environmentId])

  useEffect(() => {
    methods.setValue('auto_deploy', environmentDeploymentRules?.auto_deploy)
    methods.setValue('auto_delete', environmentDeploymentRules?.auto_delete)
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
      <PageSettingsDeployment onSubmit={onSubmit} />
    </FormProvider>
  )
}

export default PageSettingsDeploymentFeature
