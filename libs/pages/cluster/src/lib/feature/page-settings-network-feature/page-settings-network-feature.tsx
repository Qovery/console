import { ServicePort } from 'qovery-typescript-axios'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  applicationsLoadingStatus,
  editApplication,
  postApplicationActionsRestart,
  selectApplicationById,
} from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsNetwork from '../../ui/page-settings-network/page-settings-network'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export const deletePort = (application?: ApplicationEntity, portId?: string) => {
  const cloneApplication = Object.assign({}, application)
  cloneApplication.ports = cloneApplication.ports?.filter((port) => port.id !== portId)
  return cloneApplication
}

export function PageSettingsNetworkFeature() {
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
    if (application) {
      dispatch(
        postApplicationActionsRestart({
          applicationId: applicationId,
          environmentId: environmentId,
          serviceType: getServiceType(application),
        })
      )
    }
  }

  return (
    <PageSettingsNetwork
      ports={application?.ports}
      loading={customPortsLoadingStatus}
      onAddNetwork={() => {
        openModal({ content: <CrudModalFeature onClose={closeModal} application={application} /> })
      }}
      onEdit={(port: ServicePort) => {
        openModal({
          content: <CrudModalFeature onClose={closeModal} application={application} port={port} />,
        })
      }}
      onDelete={(port: ServicePort) => {
        openModalConfirmation({
          title: 'Delete Network',
          isDelete: true,
          description: 'Are you sure you want to delete this network?',
          name: application?.name,
          action: () => {
            if (application) {
              const cloneApplication = deletePort(application, port.id)
              dispatch(
                editApplication({
                  applicationId: applicationId,
                  data: cloneApplication,
                  serviceType: getServiceType(application),
                  toasterCallback,
                })
              )
            }
          },
        })
      }}
    />
  )
}

export default PageSettingsNetworkFeature
