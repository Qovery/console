import { ServicePortPorts } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { applicationsLoadingStatus, selectApplicationById } from '@console/domains/application'
import { ApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import { useModal } from '@console/shared/ui'
import { RootState } from '@console/store/data'
import PageSettingsPorts from '../../ui/page-settings-ports/page-settings-ports'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function PageSettingsPortsFeature() {
  // const dispatch = useDispatch<AppDispatch>()

  const { applicationId = '' } = useParams()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) => a?.id === b?.id
  )

  const customPortsLoadingStatus = useSelector<RootState, LoadingStatus>(applicationsLoadingStatus)

  const { openModal, closeModal } = useModal()
  // const { openModalConfirmation } = useModalConfirmation()

  return (
    <PageSettingsPorts
      ports={application?.ports}
      loading={customPortsLoadingStatus}
      onAddPort={() => {
        openModal({ content: <CrudModalFeature onClose={closeModal} application={application} /> })
      }}
      onEdit={(port: ServicePortPorts) => {
        openModal({
          content: <CrudModalFeature onClose={closeModal} application={application} port={port} />,
        })
      }}
      onDelete={(port: ServicePortPorts) => {
        console.log(port)
        // openModalConfirmation({
        //   title: 'Delete Port',
        //   isDelete: true,
        //   description: 'Are you sure you want to delete this port?',
        //   name: port.name || '',
        //   action: () => {
        //     // dispatch(deleteCustomDomain({ applicationId, port }))
        //   },
        // })
      }}
    />
  )
}

export default PageSettingsPortsFeature
