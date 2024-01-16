import { type ProjectDeploymentRuleRequest, type Value } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useCreateDeploymentRule } from '@qovery/domains/projects/feature'
import { weekdaysValues } from '@qovery/shared/enums'
import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageCreateEditDeploymentRule from '../../ui/page-create-edit-deployment-rule/page-create-edit-deployment-rule'

export function PageCreateDeploymentRuleFeature() {
  const { organizationId = '', projectId = '' } = useParams()
  useDocumentTitle('Create Deployment Rule - Qovery')

  const { control, handleSubmit, setValue } = useForm()

  const navigate = useNavigate()

  const { mutateAsync: createDeploymentRule } = useCreateDeploymentRule()
  const { data: clusters } = useClusters({ organizationId })

  useEffect(() => {
    setValue('timezone', 'UTC')
    setValue('start_time', '08:00')
    setValue('stop_time', '19:00')
    setValue('mode', 'PRODUCTION')
    setValue('auto_stop', false)
    setValue('weekdays', weekdaysValues)
  }, [setValue, organizationId])

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      const fields = data as ProjectDeploymentRuleRequest
      fields.start_time = `1970-01-01T${fields.start_time}:00.000Z`
      fields.stop_time = `1970-01-01T${fields.stop_time}:00.000Z`
      fields.weekdays = data['weekdays'][0].value ? data['weekdays'].map((day: Value) => day.value) : data['weekdays']

      try {
        await createDeploymentRule({ projectId, deploymentRuleRequest: fields })
        navigate(`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}`)
      } catch (error) {
        console.error(error)
      }
    }
  })

  return <PageCreateEditDeploymentRule title="Create rule" control={control} clusters={clusters} onSubmit={onSubmit} />
}

export default PageCreateDeploymentRuleFeature
