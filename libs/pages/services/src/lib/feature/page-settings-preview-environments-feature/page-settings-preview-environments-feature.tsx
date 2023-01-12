import { EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import {
  editEnvironmentDeploymentRules,
  environmentsLoadingEnvironmentDeploymentRules,
  environmentsLoadingStatus,
  fetchEnvironmentDeploymentRules,
  selectEnvironmentDeploymentRulesByEnvId,
} from '@qovery/domains/environment'
import { getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import { PageSettingsPreviewEnvironments } from '../../ui/page-settings-preview-environments/page-settings-preview-environments'

export function PageSettingsPreviewEnvironmentsFeature() {
  const { environmentId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)

  const environmentDeploymentRules = useSelector<RootState, EnvironmentDeploymentRule | undefined>(
    (state) => selectEnvironmentDeploymentRulesByEnvId(state, environmentId),
    (a, b) => a?.auto_preview === b?.auto_preview
  )

  const loadingStatusEnvironment = useSelector(environmentsLoadingStatus)

  const loadingStatusEnvironmentDeploymentRules = useSelector(environmentsLoadingEnvironmentDeploymentRules)

  const applications = useSelector<RootState, ApplicationEntity[] | undefined>(
    (state) => selectApplicationsEntitiesByEnvId(state, environmentId),
    (a, b) =>
      JSON.stringify(a?.map((application) => application.auto_preview)) ===
      JSON.stringify(b?.map((application) => application.auto_preview))
  )

  const methods = useForm({
    mode: 'onChange',
  })

  const watchEnvPreview = methods.watch('auto_preview')

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

      await applications?.forEach(async (application: ApplicationEntity) => {
        if (application.id === Object.keys(data).find((key) => key === application.id)) {
          const cloneApplication: ApplicationEntity = Object.assign({}, application as ApplicationEntity)
          cloneApplication.auto_preview = data[application.id]

          await dispatch(
            editApplication({
              applicationId: application.id,
              data: cloneApplication,
              serviceType: getServiceType(application),
              silentToaster: true,
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              toasterCallback: () => {},
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
