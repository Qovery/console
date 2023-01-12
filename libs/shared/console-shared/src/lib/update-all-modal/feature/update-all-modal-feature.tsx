import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchApplicationCommits,
  fetchApplications,
  selectApplicationsEntitiesByEnvId,
} from '@qovery/domains/application'
import { getServiceType, isApplication, isGitJob } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'

export interface UpdateAllModalFeatureProps {
  environmentId: string
  projectId: string
}

export function UpdateAllModalFeature(props: UpdateAllModalFeatureProps) {
  const { environmentId } = props
  // const environment = useSelector<RootState, EnvironmentEntity | undefined>((state: RootState) =>
  //   selectEnvironmentById(state, props.environmentId)
  // )
  const dispatch: AppDispatch = useDispatch()
  const applications = useSelector<RootState, ApplicationEntity[] | undefined>(
    (state: RootState) => selectApplicationsEntitiesByEnvId(state, environmentId),
    (a, b) => {
      if (!a || !b) {
        return false
      }
      return a.length === b.length
    }
  )

  useEffect(() => {
    dispatch(fetchApplications({ environmentId }))
  }, [dispatch, environmentId])

  useEffect(() => {
    applications?.forEach((application) => {
      if (isApplication(application) || isGitJob(application)) {
        dispatch(fetchApplicationCommits({ applicationId: application.id, serviceType: getServiceType(application) }))
      }
    })
  }, [applications, dispatch])

  return (
    <div>
      <h1>Welcome to UpdateAllModalFeature!</h1>
    </div>
  )
}

export default UpdateAllModalFeature
