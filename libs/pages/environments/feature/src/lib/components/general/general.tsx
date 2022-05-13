import { GeneralPage } from '@console/pages/environments/ui'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { selectEnvironmentsEntitiesByProjectId } from '@console/domains/environment'
import { RootState } from '@console/shared/interfaces'
import { Environment } from 'qovery-typescript-axios'

export function General() {
  const { projectId = '' } = useParams()
  const environments = useSelector<RootState, Environment[]>((state) =>
    selectEnvironmentsEntitiesByProjectId(state, projectId)
  )

  return <GeneralPage environments={environments} />
}

export default General
