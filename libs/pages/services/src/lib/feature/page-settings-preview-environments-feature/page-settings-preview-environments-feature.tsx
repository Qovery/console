import { Application, EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  editApplication,
  postApplicationActionsRestart,
  selectApplicationsEntitiesByEnvId,
} from '@console/domains/application'
import {
  editEnvironmentDeploymentRules,
  environmentsLoadingEnvironmentDeploymentRules,
  environmentsLoadingStatus,
  fetchEnvironmentDeploymentRules,
  selectEnvironmentDeploymentRulesByEnvId,
} from '@console/domains/environment'
import { GitApplicationEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import { PageSettingsPreviewEnvironments } from '../../ui/page-settings-preview-environments/page-settings-preview-environments'

export function PageSettingsPreviewEnvironmentsFeature() {
  const { applicationId = '', environmentId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)

  const environmentDeploymentRules = useSelector<RootState, EnvironmentDeploymentRule | undefined>(
    (state) => selectEnvironmentDeploymentRulesByEnvId(state, environmentId),
    (a, b) => a?.auto_preview === b?.auto_preview
  )

  const loadingStatusEnvironment = useSelector(environmentsLoadingStatus)

  const loadingStatusEnvironmentDeploymentRules = useSelector(environmentsLoadingEnvironmentDeploymentRules)

  const applications = useSelector<RootState, GitApplicationEntity[] | undefined>(
    (state) => selectApplicationsEntitiesByEnvId(state, environmentId),
    (a, b) =>
      JSON.stringify(a?.map((application) => application.auto_preview)) ===
      JSON.stringify(b?.map((application) => application.auto_preview))
  )

  const methods = useForm({
    mode: 'onChange',
  })

  const watchEnvPreview = methods.watch('auto_preview')

  const toasterCallback = () => {
    dispatch(postApplicationActionsRestart({ applicationId, environmentId }))
  }

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data) {
      setLoading(true)
      // update auto preview for environment
      const cloneEnvironmentDeploymentRules = Object.assign({}, environmentDeploymentRules as EnvironmentDeploymentRule)
      cloneEnvironmentDeploymentRules.auto_preview = data['auto_preview']

      await dispatch(
        editEnvironmentDeploymentRules({
          environmentId,
          deploymentRuleId: environmentDeploymentRules?.id || '',
          data: cloneEnvironmentDeploymentRules,
        })
      )

      applications?.forEach(async (application: Application) => {
        if (application.id === Object.keys(data).find((key) => key === application.id)) {
          const cloneApplication = Object.assign({}, application as Application)
          cloneApplication.auto_preview = data[application.id]
          await dispatch(
            editApplication({
              applicationId: application.id,
              data: cloneApplication,
              toasterCallback,
            })
          )
        }
      })

      setLoading(false)
    }
  })

  useEffect(() => {
    //set all preview applications "true" when env preview is true
    if (loadingStatusEnvironmentDeploymentRules === 'loaded') {
      applications?.forEach((application) => methods.setValue(application.id, watchEnvPreview))
    }
  }, [loadingStatusEnvironmentDeploymentRules, watchEnvPreview, methods, applications])

  useEffect(() => {
    if (loadingStatusEnvironment === 'loaded') dispatch(fetchEnvironmentDeploymentRules(environmentId))
  }, [dispatch, loadingStatusEnvironment, environmentId])

  useEffect(() => {
    if (loadingStatusEnvironmentDeploymentRules === 'loaded') {
      methods.setValue('auto_preview', environmentDeploymentRules?.auto_preview)
      applications?.forEach((application) => methods.setValue(application.id, application.auto_preview))
    }
  }, [loadingStatusEnvironmentDeploymentRules, methods, environmentDeploymentRules, applications])

  return (
    <FormProvider {...methods}>
      <PageSettingsPreviewEnvironments onSubmit={onSubmit} applications={applications} loading={loading} />
    </FormProvider>
  )
}

export default PageSettingsPreviewEnvironmentsFeature
