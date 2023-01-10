import { Cluster, ProjectDeploymentRule, ProjectDeploymentRuleRequest } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchClusters, selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { fetchDeploymentRule, selectDeploymentRuleById, updateDeploymentRule } from '@qovery/domains/projects'
import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { dateToHours, useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageCreateEditDeploymentRule from '../../ui/page-create-edit-deployment-rule/page-create-edit-deployment-rule'

export function PageEditDeploymentRuleFeature() {
  const { deploymentRuleId = '', organizationId = '', projectId = '' } = useParams()
  useDocumentTitle('Edit Deployment Rule - Qovery')
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { control, handleSubmit, setValue } = useForm()

  const deploymentRule = useSelector<RootState, ProjectDeploymentRule | undefined>((state) =>
    selectDeploymentRuleById(state, deploymentRuleId)
  )

  const clusters = useSelector<RootState, Cluster[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      data['start_time'] = `1970-01-01T${data['start_time']}:00.000Z`
      data['stop_time'] = `1970-01-01T${data['stop_time']}:00.000Z`

      delete data['id']

      const result = await dispatch(
        updateDeploymentRule({ projectId, deploymentRuleId, data: data as ProjectDeploymentRuleRequest })
      )
      if (result.payload) {
        navigate(`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}`)
      }
    }
  })

  useEffect(() => {
    dispatch(fetchDeploymentRule({ projectId, deploymentRuleId }))
    dispatch(fetchClusters({ organizationId }))
  }, [dispatch, organizationId, projectId, deploymentRuleId])

  useEffect(() => {
    const startTime = deploymentRule?.start_time && dateToHours(deploymentRule?.start_time)
    const stopTime = deploymentRule?.stop_time && dateToHours(deploymentRule?.stop_time)

    setValue('id', deploymentRule?.id)
    setValue('name', deploymentRule?.name)
    setValue('timezone', 'UTC')
    setValue('start_time', startTime)
    setValue('stop_time', stopTime)
    setValue('mode', deploymentRule?.mode)
    setValue('auto_deploy', deploymentRule?.auto_deploy)
    setValue('auto_delete', deploymentRule?.auto_delete)
    setValue('auto_stop', deploymentRule?.auto_stop)
    setValue('weekdays', deploymentRule?.weekdays)
    setValue('wildcard', deploymentRule?.wildcard)
    setValue('description', deploymentRule?.description)
    setValue('cluster_id', deploymentRule?.cluster_id)
  }, [deploymentRule, setValue])

  return (
    <PageCreateEditDeploymentRule
      title={`Edit ${deploymentRule?.name || ''}`}
      btnLabel="Edit rule"
      control={control}
      clusters={clusters}
      onSubmit={onSubmit}
      defaultAutoStop={deploymentRule?.auto_stop}
    />
  )
}

export default PageEditDeploymentRuleFeature
