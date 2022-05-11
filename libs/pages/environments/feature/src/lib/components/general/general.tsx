import { useEnvironments } from '@console/domains/projects'
import { GeneralPage } from '@console/pages/environments/ui'
import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { selectEnvironmentsEntitiesByProjectId } from '@console/domains/environment'

export function General() {
  const { getEnvironmentsStatus } = useEnvironments()
  const { projectId = '' } = useParams()
  const environments = useSelector((state) => selectEnvironmentsEntitiesByProjectId(state, projectId))

  useEffect(() => {
    setTimeout(() => {
      projectId && getEnvironmentsStatus(projectId)
    }, 1000)
  }, [projectId, getEnvironmentsStatus])

  return <GeneralPage environments={environments} />
}

export default General
