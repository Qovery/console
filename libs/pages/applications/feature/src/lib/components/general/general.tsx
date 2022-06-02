import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Application } from 'qovery-typescript-axios'
import {
  applicationFactoryMock,
  applicationsLoadingStatus,
  selectApplicationsEntitiesByEnvId,
} from '@console/domains/application'
import { RootState } from '@console/store/data'
import { GeneralPage } from '@console/pages/applications/ui'

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
