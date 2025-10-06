import { type ClusterRoutingTableResultsInner } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useCluster, useClusterRoutingTable, useEditRoutingTable } from '@qovery/domains/clusters/feature'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import PageSettingsNetwork from '../../ui/page-settings-network/page-settings-network'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export const deleteRoutes = (routes: ClusterRoutingTableResultsInner[], destination?: string) => {
  return [...routes]?.filter((port) => port.destination !== destination)
}

export function PageSettingsNetworkFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })
  const { data: clusterRoutingTable, isLoading: isClusterRoutingTableLoading } = useClusterRoutingTable({
    organizationId,
    clusterId,
  })
  const isLoading = isClusterLoading || isClusterRoutingTableLoading
  const { mutateAsync: editRoutingTable } = useEditRoutingTable()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <PageSettingsNetwork
      cluster={cluster}
      isLoading={isLoading}
      routes={clusterRoutingTable}
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
          confirmationMethod: 'action',
          name: route.target,
          action: () => {
            if (clusterRoutingTable && clusterRoutingTable.length > 0) {
              const cloneRoutes = deleteRoutes(clusterRoutingTable, route.destination)
              editRoutingTable({
                clusterId,
                organizationId,
                routingTableRequest: { routes: cloneRoutes },
              })
            }
          },
        })
      }}
    />
  )
}

export default PageSettingsNetworkFeature
