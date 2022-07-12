import { AppDispatch, RootState } from '@console/store/data'
import { Cluster, ProjectDeploymentRule, ProjectDeploymentRuleRequest } from 'qovery-typescript-axios'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router'
import { fetchDeploymentRule, selectDeploymentRuleById, updateDeploymentRule } from '@console/domains/projects'
import { fetchClusters, selectClustersEntitiesByOrganizationId } from '@console/domains/organization'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { BaseLink } from '@console/shared/ui'
import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, ENVIRONMENTS_URL } from '@console/shared/router'
import { dateToHours } from '@console/shared/utils'
import PageCreateEditDeploymentRule from '../../ui/page-create-edit-deployment-rule/page-create-edit-deployment-rule'

export function PageEditDeploymentRuleFeature() {
  const { deploymentRuleId = '', organizationId = '', projectId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { control, handleSubmit, setValue } = useForm()

  const deploymentRule = useSelector<RootState, ProjectDeploymentRule | undefined>((state) =>
    selectDeploymentRuleById(state, deploymentRuleId)
  )

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/deployment-rule/',
      linkLabel: 'How to configure my deployment rule',
      external: true,
    },
  ]

  const clusters = useSelector<RootState, Cluster[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      delete data['id']
      const fields = data as ProjectDeploymentRuleRequest
      fields.start_time = `1970-01-01T${fields.start_time}:00.000Z`
      fields.stop_time = `1970-01-01T${fields.stop_time}:00.000Z`

      await dispatch(updateDeploymentRule({ projectId, deploymentRuleId, ...fields }))
        .then((res) => {
          if (res) navigate(`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}`)
        })
        .catch((err) => err)
    }
  })

  useEffect(() => {
    dispatch(fetchClusters({ organizationId }))
    dispatch(fetchDeploymentRule({ projectId, deploymentRuleId }))

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
  }, [deploymentRule, setValue, dispatch, organizationId, deploymentRuleId, projectId])

  return (
    <PageCreateEditDeploymentRule
      listHelpfulLinks={listHelpfulLinks}
      control={control}
      clusters={clusters}
      onSubmit={onSubmit}
    />
  )
}

export default PageEditDeploymentRuleFeature
