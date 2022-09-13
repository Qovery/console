import { ServicePort } from 'qovery-typescript-axios'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import {
  applicationsLoadingStatus,
  editApplication,
  postApplicationActionsRestart,
  selectApplicationById,
} from '@console/domains/application'
import { ApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import { useModal, useModalConfirmation } from '@console/shared/ui'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsPorts from '../../ui/page-settings-ports/page-settings-ports'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export const deletePort = (application?: ApplicationEntity, portId?: string) => {
  const cloneApplication = Object.assign({}, application)
  cloneApplication.ports = cloneApplication.ports?.filter((port) => port.id !== portId)
  return cloneApplication
}

export function PageSettingsPortsFeature() {
  const dispatch = useDispatch<AppDispatch>()

  const { applicationId = '', environmentId = '' } = useParams()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) => JSON.stringify(a?.ports) === JSON.stringify(b?.ports)
  )

  const customPortsLoadingStatus = useSelector<RootState, LoadingStatus>(applicationsLoadingStatus)

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const toasterCallback = () => {
    dispatch(postApplicationActionsRestart({ applicationId: applicationId, environmentId: environmentId }))
  }

  return (
    <PageSettingsPorts
      ports={application?.ports}
      loading={customPortsLoadingStatus}
      onAddPort={() => {
        openModal({ content: <CrudModalFeature onClose={closeModal} application={application} /> })
      }}
      onEdit={(port: ServicePort) => {
        openModal({
          content: <CrudModalFeature onClose={closeModal} application={application} port={port} />,
        })
      }}
      onDelete={(port: ServicePort) => {
        openModalConfirmation({
          title: 'Delete Port',
          isDelete: true,
          description: 'Are you sure you want to delete this port?',
          name: application?.name,
          action: () => {
            const cloneApplication = deletePort(application, port.id)
            dispatch(
              editApplication({
                applicationId: applicationId,
                data: cloneApplication,
                toasterCallback,
              })
            )
          },
        })
      }}
    />
  )
}

export default PageSettingsPortsFeature
