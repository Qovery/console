import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ApplicationEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import {
  // editEnvironmentDeploymentRules,
  fetchEnvironmentDeploymentRules,
  selectEnvironmentDeploymentRulesEntitiesById,
} from '@console/domains/environment'
import PageSettingsPreviewEnvironments from '../../ui/page-settings-preview-environments/page-settings-preview-environments'
import { FormProvider, useForm } from 'react-hook-form'
import { EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { selectApplicationsEntitiesByEnvId } from '@console/domains/application'
import equal from 'fast-deep-equal'

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
      console.log(environmentDeploymentRules)
      console.log(data)
      // const result = await dispatch(editEnvironmentDeploymentRules(environmentId))
      // console.log(data)
    }
  })

  useEffect(() => {
    // set all preview applications "true" when env preview is true
    if (watchEnvPreview) {
      applications?.forEach((application) => methods.setValue(application.id, true))
    }
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
      <PageSettingsPreviewEnvironments
        onSubmit={onSubmit}
        applications={applications}
        watchEnvPreview={watchEnvPreview}
      />
    </FormProvider>
  )
}

export default PageSettingsPreviewEnvironmentsFeature
