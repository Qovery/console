import { useEnvironments } from '@console/domains/projects'
import { GeneralPage } from '@console/pages/environments/ui'
import { useEffect } from 'react'
import { useParams } from 'react-router'

export function General() {
  const { environments, getEnvironmentsStatus } = useEnvironments()
  const { projectId } = useParams()

  useEffect(() => {
    setTimeout(() => {
      projectId && getEnvironmentsStatus(projectId)
    }, 1000)
  }, [projectId, getEnvironmentsStatus])

  return <GeneralPage environments={environments} />
}

export default General
