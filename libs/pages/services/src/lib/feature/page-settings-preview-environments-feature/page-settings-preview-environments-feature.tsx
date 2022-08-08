import equal from 'fast-deep-equal'
import { Application, EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, selectApplicationsEntitiesByEnvId } from '@console/domains/application'
import {
  editEnvironmentDeploymentRules,
  fetchEnvironmentDeploymentRules,
  selectEnvironmentDeploymentRulesEntitiesById,
} from '@console/domains/environment'
import { ApplicationEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsPreviewEnvironments from '../../ui/page-settings-preview-environments/page-settings-preview-environments'

export function PageSettingsPreviewEnvironmentsFeature() {
  const { environmentId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const environmentDeploymentRules = useSelector<RootState, EnvironmentDeploymentRule | undefined>(
    (state) => selectEnvironmentDeploymentRulesEntitiesById(state, environmentId),
    equal
  )
  const applications = useSelector<RootState, ApplicationEntity[] | undefined>(
    (state) => selectApplicationsEntitiesByEnvId(state, environmentId),
    equal
  )

  const methods = useForm({
    mode: 'onChange',
  })

  const watchEnvPreview = methods.watch('auto_preview')

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data) {
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
            })
          )
        }
      })
    }
  })

  useEffect(() => {
    // set all preview applications "true" when env preview is true
    applications?.forEach((application) => methods.setValue(application.id, watchEnvPreview))
  }, [watchEnvPreview, methods, applications])

  useEffect(() => {
    async function fetchDeploymentRules() {
      await dispatch(fetchEnvironmentDeploymentRules(environmentId))
    }
    fetchDeploymentRules()
  }, [dispatch, environmentId])

  useEffect(() => {
    methods.setValue('auto_preview', environmentDeploymentRules?.auto_preview)
    applications?.forEach((application) => methods.setValue(application.id, application.auto_preview))
  }, [methods, environmentDeploymentRules, applications])

  return (
    <FormProvider {...methods}>
      <PageSettingsPreviewEnvironments onSubmit={onSubmit} applications={applications} />
    </FormProvider>
  )
}

export default PageSettingsPreviewEnvironmentsFeature
