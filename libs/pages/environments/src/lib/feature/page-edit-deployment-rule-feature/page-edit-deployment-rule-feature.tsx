import { type ProjectDeploymentRuleRequest } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useDeploymentRule, useEditDeploymentRule } from '@qovery/domains/projects/feature'
import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { dateToHours } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageCreateEditDeploymentRule from '../../ui/page-create-edit-deployment-rule/page-create-edit-deployment-rule'

export function PageEditDeploymentRuleFeature() {
  const { deploymentRuleId = '', organizationId = '', projectId = '' } = useParams()
  useDocumentTitle('Edit Deployment Rule - Qovery')
  const navigate = useNavigate()
  const { control, handleSubmit, setValue } = useForm()

  const { data: deploymentRule } = useDeploymentRule({ projectId, deploymentRuleId })
  const { data: clusters } = useClusters({ organizationId })
  const { mutateAsync: editDeploymentRule } = useEditDeploymentRule()

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      data['start_time'] = `1970-01-01T${data['start_time']}:00.000Z`
      data['stop_time'] = `1970-01-01T${data['stop_time']}:00.000Z`

      delete data['id']

      try {
        await editDeploymentRule({
          projectId,
          deploymentRuleId,
          deploymentRuleRequest: data as ProjectDeploymentRuleRequest,
        })
        navigate(`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}`)
      } catch (error) {
        console.error(error)
      }
    }
  })

  useEffect(() => {
    const startTime = deploymentRule?.start_time && dateToHours(deploymentRule?.start_time)
    const stopTime = deploymentRule?.stop_time && dateToHours(deploymentRule?.stop_time)

    setValue('id', deploymentRule?.id)
    setValue('name', deploymentRule?.name)
    setValue('timezone', 'UTC')
    setValue('start_time', startTime)
    setValue('stop_time', stopTime)
    setValue('mode', deploymentRule?.mode)
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
