import { type ClusterRequestFeaturesInner, type ClusterRoutingTableResultsInner } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
  useCluster,
  useClusterRoutingTable,
  useEditCluster,
  useEditRoutingTable,
} from '@qovery/domains/clusters/feature'
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
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const isScalewayCluster = cluster?.cloud_provider === 'SCW'

  // Initialize form with cluster features for Scaleway
  const methods = useForm({
    mode: 'onChange',
  })

  // Set default values from cluster features when cluster data is loaded
  useEffect(() => {
    if (cluster?.features && isScalewayCluster) {
      const featuresData: Record<string, { value: boolean; extendedValue?: string }> = {}
      cluster.features.forEach((feature) => {
        if (feature.id) {
          // Special handling for NAT_GATEWAY - extract type from object format
          if (feature.id === 'NAT_GATEWAY' && feature.value_object?.value) {
            const natGatewayValue = feature.value_object.value as unknown as { nat_gateway_type: { type: string } }
            const natGatewayType =
              natGatewayValue?.nat_gateway_type?.type ||
              (typeof natGatewayValue === 'string' ? natGatewayValue : undefined)
            featuresData[feature.id] = {
              value: Boolean(natGatewayType),
              extendedValue: natGatewayType,
            }
          } else {
            featuresData[feature.id] = {
              value: Boolean(feature.value_object?.value),
              extendedValue: typeof feature.value_object?.value === 'string' ? feature.value_object.value : undefined,
            }
          }
        }
      })
      methods.reset({ features: featuresData })
    }
  }, [cluster, isScalewayCluster, methods])

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!cluster) return

    const features = cluster.features?.map((feature) => {
      const formFeature = data['features']?.[feature.id || '']

      if (feature.id === 'STATIC_IP' && formFeature) {
        return {
          ...feature,
          value: formFeature.value,
        }
      }

      if (feature.id === 'NAT_GATEWAY' && formFeature && isScalewayCluster) {
        if (formFeature.extendedValue) {
          return {
            ...feature,
            value: {
              nat_gateway_type: {
                provider: 'scaleway',
                type: formFeature.extendedValue,
              },
            } as unknown as ClusterRequestFeaturesInner['value'],
          }
        }
        return {
          ...feature,
          value: null,
        }
      }

      return feature
    })

    try {
      await editCluster({
        organizationId,
        clusterId,
        clusterRequest: {
          ...cluster,
          features,
        },
      })
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsNetwork
        cluster={cluster}
        isLoading={isLoading}
        isEditClusterLoading={isEditClusterLoading}
        routes={clusterRoutingTable}
        onSubmit={onSubmit}
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
            action: async () => {
              try {
                if (clusterRoutingTable && clusterRoutingTable.length > 0) {
                  const cloneRoutes = deleteRoutes(clusterRoutingTable, route.destination)
                  await editRoutingTable({
                    clusterId,
                    organizationId,
                    routingTableRequest: { routes: cloneRoutes },
                  })
                }
              } catch (error) {
                console.error(error)
              }
            },
          })
        }}
      />
    </FormProvider>
  )
}

export default PageSettingsNetworkFeature
