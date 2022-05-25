import { CreateDeploymentRulePage } from '@console/pages/environments/ui'
import { BaseLink } from '@console/shared/ui'
import { RootState } from '@console/store/data'
import { selectClustersEntitiesByOrganizationId } from '@console/domains/organization'
import { Cluster } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

export function CreateDeploymentRule() {
  const { organizationId = '' } = useParams()
  const listHelpfulLinks: BaseLink[] = [{ link: '#', linkLabel: 'How to configure my application', external: true }]
  const { control, handleSubmit, setValue } = useForm()

  const clusters = useSelector<RootState, Cluster[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )

  useEffect(() => {
    setValue('timezone', 'utc')
    setValue('start_time', '08:00')
    setValue('stop_time', '19:00')
    setValue('mode', 'production')
    setValue('auto_deploy', false)
    setValue('auto_delete', false)
    setValue('auto_stop', false)
  }, [setValue])

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      console.log(data)
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
