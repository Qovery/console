/* eslint-disable-next-line */
import { GeneralPage } from '@console/pages/application/ui'
import { BaseLink } from '@console/shared/ui'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { getApplicationsState } from '@console/domains/application'
import { ApplicationEntity, RootState } from '@console/shared/interfaces'

export function General() {
  const { applicationId = '' } = useParams()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )
  const listHelpfulLinks: BaseLink[] = [{ link: '#', linkLabel: 'How to configure my application', external: true }]

  return <GeneralPage application={application} listHelpfulLinks={listHelpfulLinks} />
}

export default General
