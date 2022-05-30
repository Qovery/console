import { GeneralPage } from '@console/pages/environments/ui'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import {
  environmentFactoryMock,
  environmentsLoadingStatus,
  selectEnvironmentsEntitiesByProjectId,
} from '@console/domains/environment'
import { RootState } from '@console/store/data'
import { EnvironmentEntity } from '@console/shared/interfaces'

export function General() {
  const { projectId = '' } = useParams()
  const loadingEnvironments = environmentFactoryMock(3, true)

  const loadingStatus = useSelector(environmentsLoadingStatus)
  const environments = useSelector<RootState, EnvironmentEntity[]>((state) =>
    selectEnvironmentsEntitiesByProjectId(state, projectId)
  )

  return (
    <GeneralPage
      key={environments[0] ? environments[0].status?.id : ''}
      environments={loadingStatus !== 'loaded' ? loadingEnvironments : environments}
    />
  )
}

export default General
