import { type EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { useEditEnvironmentDeploymentRule, useFetchEnvironmentDeploymentRule } from '@qovery/domains/environment'
import { getServiceType } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import { PageSettingsPreviewEnvironments } from '../../ui/page-settings-preview-environments/page-settings-preview-environments'

export function PageSettingsPreviewEnvironmentsFeature() {
  const { projectId = '', environmentId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)

  const { isFetched: loadingStatusEnvironmentDeploymentRules, data: environmentDeploymentRules } =
    useFetchEnvironmentDeploymentRule(projectId, environmentId)
  const editEnvironmentDeploymentRule = useEditEnvironmentDeploymentRule(projectId, environmentId)

  const applications = useSelector<RootState, ApplicationEntity[] | undefined>(
    (state) => selectApplicationsEntitiesByEnvId(state, environmentId),
    (a, b) =>
      JSON.stringify(a?.map((application) => application.auto_preview)) ===
      JSON.stringify(b?.map((application) => application.auto_preview))
  )

  const methods = useForm({
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data) {
      setLoading(true)
      // update auto preview for environment
      const cloneEnvironmentDeploymentRules = Object.assign({}, environmentDeploymentRules as EnvironmentDeploymentRule)
      cloneEnvironmentDeploymentRules.auto_preview = data['auto_preview']
      cloneEnvironmentDeploymentRules.on_demand_preview = data['on_demand_preview']

      await editEnvironmentDeploymentRule.mutate({
        environmentId,
        deploymentRuleId: environmentDeploymentRules?.id || '',
        data: cloneEnvironmentDeploymentRules,
      })

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

  const toggleAll = (value: boolean) => {
    methods.setValue('on_demand_preview', value)
    //set all preview applications "true" when env preview is true
    if (loadingStatusEnvironmentDeploymentRules) {
      applications?.forEach((application) => methods.setValue(application.id, value, { shouldDirty: true }))
    }
  }

  // Force enable Preview if we enable preview from the 1rst application
  const toggleEnablePreview = (value: boolean) => {
    const isApplicationPreviewEnabled = applications ? applications.some((app) => app.auto_preview) : false
    if (isApplicationPreviewEnabled || !value) {
      return
    }

    methods.setValue('on_demand_preview', value)
    methods.setValue('auto_preview', value)
  }

  useEffect(() => {
    // !loading is here to prevent the toggle to glitch the time we are submitting the two api endpoints
    if (environmentDeploymentRules && loadingStatusEnvironmentDeploymentRules && !loading) {
      const isApplicationPreviewEnabled = applications ? applications.some((app) => app.auto_preview) : false
      methods.setValue('auto_preview', environmentDeploymentRules.auto_preview || isApplicationPreviewEnabled)
      methods.setValue('on_demand_preview', environmentDeploymentRules.on_demand_preview)
      applications?.forEach((application) => methods.setValue(application.id, application.auto_preview))
    }
  }, [loadingStatusEnvironmentDeploymentRules, methods, environmentDeploymentRules, applications])

  return (
    <FormProvider {...methods}>
      <PageSettingsPreviewEnvironments
        onSubmit={onSubmit}
        applications={applications}
        loading={loading}
        toggleAll={toggleAll}
        toggleEnablePreview={toggleEnablePreview}
      />
    </FormProvider>
  )
}

export default PageSettingsPreviewEnvironmentsFeature
