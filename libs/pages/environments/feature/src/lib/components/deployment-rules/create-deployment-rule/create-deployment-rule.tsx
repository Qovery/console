import { BaseLink } from '@console/shared/ui'
import { AppDispatch, RootState } from '@console/store/data'
import { fetchClusters, selectClustersEntitiesByOrganizationId } from '@console/domains/organization'
import { Cluster, ProjectDeploymentRuleRequest } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router'
import { postDeploymentRules } from '@console/domains/projects'
import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, ENVIRONMENTS_URL } from '@console/shared/utils'
import { CreateDeploymentRulePage } from '@console/pages/environments/ui'

export function CreateDeploymentRule() {
  const { organizationId = '', projectId = '' } = useParams()
  const listHelpfulLinks: BaseLink[] = [{ link: '#', linkLabel: 'How to configure my application', external: true }]
  const { control, handleSubmit, setValue } = useForm()

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const clusters = useSelector<RootState, Cluster[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )

  useEffect(() => {
    dispatch(fetchClusters({ organizationId }))

    setValue('timezone', 'UTC')
    setValue('start_time', '08:00')
    setValue('stop_time', '19:00')
    setValue('mode', 'PRODUCTION')
    setValue('auto_deploy', false)
    setValue('auto_delete', false)
    setValue('auto_stop', false)
    setValue('weekdays', [])
  }, [setValue, dispatch, organizationId])

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      const fields = data as ProjectDeploymentRuleRequest
      fields.start_time = `1970-01-01T${fields.start_time}:00.000Z`
      fields.stop_time = `1970-01-01T${fields.stop_time}:00.000Z`

      await dispatch(postDeploymentRules({ projectId, ...fields }))
        .then(() => {
          navigate(`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}`)
        })
        .catch((err) => console.log('error', err))
    }
  })

  return (
    <CreateDeploymentRulePage
      listHelpfulLinks={listHelpfulLinks}
      control={control}
      clusters={clusters}
      onSubmit={onSubmit}
    />
  )
}

export default CreateDeploymentRule
