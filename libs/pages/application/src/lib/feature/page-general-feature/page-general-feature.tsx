import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { applicationsLoadingStatus, getApplicationsState } from '@qovery/domains/application'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { BaseLink } from '@qovery/shared/ui'
import { RootState } from '@qovery/store'
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
