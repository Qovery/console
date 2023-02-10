import { ServicePort } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { applicationsLoadingStatus } from '@qovery/domains/application'
import { fetchClusterRoutingTable, postClusterActionsDeploy, selectClusterById } from '@qovery/domains/organization'
import { ApplicationEntity, ClusterEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { useModalConfirmation } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsNetwork from '../../ui/page-settings-network/page-settings-network'

export const deletePort = (application?: ApplicationEntity, portId?: string) => {
  const cloneApplication = Object.assign({}, application)
  cloneApplication.ports = cloneApplication.ports?.filter((port) => port.id !== portId)
  return cloneApplication
}

export function PageSettingsNetworkFeature() {
  const dispatch = useDispatch<AppDispatch>()

  const { organizationId = '', clusterId = '' } = useParams()

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) => selectClusterById(state, clusterId))

  const customPortsLoadingStatus = useSelector<RootState, LoadingStatus>(applicationsLoadingStatus)

  // const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  useEffect(() => {
    if (cluster?.routingTable?.loadingStatus !== 'loaded')
      dispatch(fetchClusterRoutingTable({ organizationId, clusterId }))
  }, [dispatch, cluster?.routingTable?.loadingStatus, organizationId, clusterId])

  const toasterCallback = () => {
    if (cluster?.routingTable) {
      dispatch(
        postClusterActionsDeploy({
          organizationId,
          clusterId,
        })
      )
    }
  }

  console.log(toasterCallback)

  return (
    <PageSettingsNetwork
      routes={cluster?.routingTable?.items}
      loading={customPortsLoadingStatus}
      onAddNetwork={() => {
        // openModal({ content: <CrudModalFeature onClose={closeModal} application={application} /> })
      }}
      onEdit={(port: ServicePort) => {
        // openModal({
        //   content: <CrudModalFeature onClose={closeModal} application={application} port={port} />,
        // })
      }}
      onDelete={(port: ServicePort) => {
        openModalConfirmation({
          title: 'Delete Network',
          isDelete: true,
          description: 'Are you sure you want to delete this network?',
          name: cluster?.name,
          action: () => {
            // if (application) {
            //   const cloneApplication = deletePort(application, port.id)
            //   dispatch(
            //     editApplication({
            //       applicationId: applicationId,
            //       data: cloneApplication,
            //       serviceType: getServiceType(application),
            //       toasterCallback,
            //     })
            //   )
            // }
          },
        })
      }}
    />
  )
}

export default PageSettingsNetworkFeature
