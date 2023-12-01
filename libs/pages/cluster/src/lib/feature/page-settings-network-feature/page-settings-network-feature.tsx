import { type ClusterRoutingTableResultsInner } from 'qovery-typescript-axios'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useClusterRoutingTable } from '@qovery/domains/clusters/feature'
import { editClusterRoutingTable, postClusterActionsDeploy } from '@qovery/domains/organization'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { type AppDispatch } from '@qovery/state/store'
import PageSettingsNetwork from '../../ui/page-settings-network/page-settings-network'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export const deleteRoutes = (routes: ClusterRoutingTableResultsInner[], destination?: string) => {
  return [...routes]?.filter((port) => port.destination !== destination)
}

export function PageSettingsNetworkFeature() {
  const dispatch = useDispatch<AppDispatch>()

  const { organizationId = '', clusterId = '' } = useParams()

  const { data: clusterRoutingTable, isLoading: isClusterRoutingTableLoading } = useClusterRoutingTable({
    organizationId,
    clusterId,
  })

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const toasterCallback = () => {
    if (clusterRoutingTable) {
      dispatch(
        postClusterActionsDeploy({
          organizationId,
          clusterId,
        })
      )
    }
  }

  return (
    <PageSettingsNetwork
      routes={clusterRoutingTable}
      loading={isClusterRoutingTableLoading}
      onAddRoute={() => {
        openModal({
          content: (
            <CrudModalFeature
              onClose={closeModal}
              clusterId={clusterId}
              organizationId={organizationId}
              routes={clusterRoutingTable}
            />
          ),
        })
      }}
      onEdit={(route: ClusterRoutingTableResultsInner) => {
        openModal({
          content: (
            <CrudModalFeature
              onClose={closeModal}
              clusterId={clusterId}
              organizationId={organizationId}
              route={route}
              routes={clusterRoutingTable}
            />
          ),
        })
      }}
      onDelete={(route: ClusterRoutingTableResultsInner) => {
        openModalConfirmation({
          title: 'Delete Network',
          isDelete: true,
          name: route.target,
          action: () => {
            if (clusterRoutingTable && clusterRoutingTable.length > 0) {
              const cloneRoutes = deleteRoutes(clusterRoutingTable, route.destination)
              dispatch(
                editClusterRoutingTable({
                  clusterId,
                  organizationId,
                  routes: cloneRoutes,
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
