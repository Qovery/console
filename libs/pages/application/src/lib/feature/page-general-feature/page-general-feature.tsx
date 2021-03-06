import { BaseLink } from '@console/shared/ui'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { applicationsLoadingStatus, getApplicationsState } from '@console/domains/application'
import { ApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import { RootState } from '@console/store/data'
import PageGeneral from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  const { applicationId = '' } = useParams()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )
  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
      linkLabel: 'How to manage my application',
      external: true,
    },
  ]
  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => applicationsLoadingStatus(state))

  const computeStability = (): number => {
    let c = 0

    application?.running_status?.pods.forEach((pod) => {
      c += pod.restart_count
    })

    return c
  }

  return (
    <PageGeneral
      application={application}
      listHelpfulLinks={listHelpfulLinks}
      loadingStatus={loadingStatus}
      serviceStability={computeStability()}
    />
  )
}

export default PageGeneralFeature
