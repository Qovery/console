import {
  applicationFactoryMock,
  applications,
  applicationsLoadingStatus,
  selectApplicationsEntitiesByEnvId,
} from '@console/domains/application'
import { GeneralPage } from '@console/pages/applications/ui'
import { RootState } from '@console/shared/interfaces'
import { Application } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

export function General() {
  const { environmentId = '' } = useParams()

  const loadingApplications = applicationFactoryMock(3)
  const loadingStatus = useSelector<RootState>((state) => applicationsLoadingStatus(state))
  const applicationsByEnv = useSelector<RootState, Application[]>((state: RootState) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
  )

  return (
    <GeneralPage
      applications={
        loadingStatus !== 'loaded' && applicationsByEnv.length === 0 ? loadingApplications : applicationsByEnv
      }
    />
  )
}

export default General
