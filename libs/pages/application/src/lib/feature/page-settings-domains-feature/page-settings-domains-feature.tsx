import { CustomDomain } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import {
  fetchCustomDomains,
  getApplicationsState,
  selectCustomDomainsByApplicationId,
} from '@console/domains/application'
import { ApplicationEntity } from '@console/shared/interfaces'
import { useModal, useModalConfirmation } from '@console/shared/ui'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsDomains from '../../ui/page-settings-domains/page-settings-domains'

export function PageSettingsDomainsFeature() {
  const dispatch = useDispatch<AppDispatch>()

  const { applicationId = '' } = useParams()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId],
    (a, b) => a?.id === b?.id
  )

  const customDomains = useSelector<RootState, CustomDomain[] | undefined>((state) =>
    selectCustomDomainsByApplicationId(state, applicationId)
  )

  const { openModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  useEffect(() => {
    if (application) {
      dispatch(fetchCustomDomains({ applicationId }))
    }
  }, [dispatch, applicationId, application])

  return (
    <PageSettingsDomains
      domains={customDomains}
      onAddDomain={() => {
        openModal({ content: <h1>Hello</h1> })
      }}
      onEdit={(customDomain) => {
        openModal({ content: <h1>Edit</h1> })
      }}
      onDelete={(customDomain) => {
        openModalConfirmation({
          title: 'Delete Custom Domain',
          isDelete: true,
          description: 'Are you sure you want to delete this custom domain?',
          name: customDomain.domain,
          action: () => {
            console.log('delete')
          },
        })
      }}
    />
  )
}

export default PageSettingsDomainsFeature
