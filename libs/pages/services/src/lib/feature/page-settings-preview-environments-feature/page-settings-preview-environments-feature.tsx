import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useDispatch, useSelector } from 'react-redux'
import { EnvironmentEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import {
  fetchEnvironmentDeploymentRules,
  selectEnvironmentById,
  selectEnvironmentDeploymentRulesByEnvId,
} from '@console/domains/environment'
import PageSettingsPreviewEnvironments from '../../ui/page-settings-preview-environments/page-settings-preview-environments'
import { FormProvider, useForm } from 'react-hook-form'

export function PageSettingsPreviewEnvironmentsFeature() {
  const { environmentId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const environment = useSelector<RootState, EnvironmentEntity | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const environmentDeploymentRules = useSelector<RootState, EnvironmentDeploymentRule | undefined>((state) =>
    selectEnvironmentDeploymentRulesByEnvId(state, environmentId)
  )

  const methods = useForm({
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    console.log(data)
    // if (data) {

    // }
  })

  useEffect(() => {
    async function fetchDeploymentRules() {
      await dispatch(fetchEnvironmentDeploymentRules(environmentId))
    }
    fetchDeploymentRules()
  }, [dispatch, environmentId])

  return (
    <FormProvider {...methods}>
      <PageSettingsPreviewEnvironments onSubmit={onSubmit} environment={environment} />
    </FormProvider>
  )
}

export default PageSettingsPreviewEnvironmentsFeature
