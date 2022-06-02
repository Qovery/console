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
import { BaseLink } from '@console/shared/ui'

export function General() {
  const { environmentId = '' } = useParams()

  const loadingApplications = applicationFactoryMock(3)
  const loadingStatus = useSelector<RootState>((state) => applicationsLoadingStatus(state))
  const applicationsByEnv = useSelector<RootState, Application[]>((state: RootState) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
  )

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
      linkLabel: 'How to configure my application',
      external: true,
    },
  ]

  return (
    <GeneralPage
      applications={
        loadingStatus !== 'loaded' && applicationsByEnv.length === 0 ? loadingApplications : applicationsByEnv
      }
      listHelpfulLinks={listHelpfulLinks}
    />
  )
}

export default General
