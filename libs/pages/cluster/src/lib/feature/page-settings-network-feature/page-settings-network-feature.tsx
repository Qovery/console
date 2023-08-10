import { ClusterRoutingTableResults } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  editClusterRoutingTable,
  fetchClusterRoutingTable,
  postClusterActionsDeploy,
  selectClusterById,
  selectClustersLoadingStatus,
} from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/state/store'
import PageSettingsNetwork from '../../ui/page-settings-network/page-settings-network'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export const deleteRoutes = (routes: ClusterRoutingTableResults[], destination?: string) => {
  return [...routes]?.filter((port) => port.destination !== destination)
}

export function PageSettingsNetworkFeature() {
  const dispatch = useDispatch<AppDispatch>()

  const { organizationId = '', clusterId = '' } = useParams()

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) => selectClusterById(state, clusterId))
  const clustersLoading = useSelector((state: RootState) => selectClustersLoadingStatus(state))

  const clusterRoutingTableLoadingStatus = cluster?.routingTable?.loadingStatus

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  useEffect(() => {
    if (clustersLoading === 'loaded' && clusterRoutingTableLoadingStatus !== 'loaded')
      dispatch(fetchClusterRoutingTable({ organizationId, clusterId }))
  }, [dispatch, clustersLoading, clusterRoutingTableLoadingStatus, organizationId, clusterId])

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

  return (
    <PageSettingsNetwork
      routes={cluster?.routingTable?.items}
      loading={clusterRoutingTableLoadingStatus}
      onAddRoute={() => {
        openModal({
          content: (
            <CrudModalFeature
              onClose={closeModal}
              clusterId={clusterId}
              organizationId={organizationId}
              routes={cluster?.routingTable?.items}
            />
          ),
        })
      }}
      onEdit={(route: ClusterRoutingTableResults) => {
        openModal({
          content: (
            <CrudModalFeature
              onClose={closeModal}
              clusterId={clusterId}
              organizationId={organizationId}
              route={route}
              routes={cluster?.routingTable?.items}
            />
          ),
        })
      }}
      onDelete={(route: ClusterRoutingTableResults) => {
        openModalConfirmation({
          title: 'Delete Network',
          isDelete: true,
          name: route.target,
          action: () => {
            if (cluster?.routingTable?.items && cluster?.routingTable?.items?.length > 0) {
              const cloneRoutes = deleteRoutes(cluster?.routingTable?.items, route.destination)
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
