import { GeneralPage } from '@console/pages/environments/ui'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import {
  environmentFactoryMock,
  environmentsLoadingStatus,
  selectEnvironmentsEntitiesByProjectId,
} from '@console/domains/environment'
import { Environment } from 'qovery-typescript-axios'
import { RootState } from '@console/store/data'

export function General() {
  const { projectId = '' } = useParams()
  const loadingEnvironments = environmentFactoryMock(3).map((env) => {
    delete env.status
    return env
  })
  const loadingStatus = useSelector(environmentsLoadingStatus)
  const environments = useSelector<RootState, Environment[]>((state) =>
    selectEnvironmentsEntitiesByProjectId(state, projectId)
  )

  return (
    <GeneralPage
      environments={loadingStatus !== 'loaded' && environments.length === 0 ? loadingEnvironments : environments}
    />
  )
}

export default General
