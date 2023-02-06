import { CloudProviderEnum, ClusterRequest } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { createCluster, postClusterActionsDeploy } from '@qovery/domains/organization'
import {
  CLUSTERS_CREATION_URL,
  CLUSTERS_URL,
  SERVICES_DATABASE_CREATION_GENERAL_URL,
  SERVICES_DATABASE_CREATION_RESOURCES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import StepSummary from '../../../ui/page-clusters-create/step-summary/step-summary'
import { useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Database')
  const { generalData, resourcesData, setCurrentStep } = useClusterContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingCreateAndDeploy, setLoadingCreateAndDeploy] = useState(false)

  const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`

  const gotoGlobalInformations = useCallback(() => {
    navigate(pathCreate + SERVICES_DATABASE_CREATION_GENERAL_URL)
  }, [navigate, pathCreate])

  const gotoResources = () => {
    navigate(pathCreate + SERVICES_DATABASE_CREATION_RESOURCES_URL)
  }

  const onBack = () => {
    if (generalData?.cloud_provider === CloudProviderEnum.AWS) {
      // gotoGlobalInformations()
    } else {
      gotoResources()
    }
  }

  // useEffect(() => {
  //   !generalData?.name && navigate(pathCreate + SERVICES_DATABASE_CREATION_GENERAL_URL)
  // }, [pathCreate, generalData, navigate, organizationId])

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = (withDeploy: boolean) => {
    if (generalData && resourcesData) {
      if (withDeploy) setLoadingCreateAndDeploy(true)
      else setLoadingCreate(true)

      const clusterRequest: ClusterRequest = {
        name: generalData.name,
        description: generalData.description || '',
        production: generalData.production,
        cloud_provider: generalData.cloud_provider,
        region: generalData.region,
        min_running_nodes: resourcesData.nodes[0],
        max_running_nodes: resourcesData.nodes[1],
        disk_size: resourcesData.disk_size,
        instance_type: resourcesData.instance_type,
        // cluster_type: resourcesData.cluster_type
        // credentials: generalData.credentials
      }

      dispatch(
        createCluster({
          organizationId,
          clusterRequest,
        })
      )
        .unwrap()
        .then((cluster) => {
          if (withDeploy) {
            dispatch(
              postClusterActionsDeploy({
                organizationId,
                clusterId: cluster.id,
              })
            )
          }
          navigate(CLUSTERS_URL(organizationId))
        })
        .catch((e) => console.error(e))
        .finally(() => {
          if (withDeploy) setLoadingCreateAndDeploy(false)
          else setLoadingCreate(false)
        })
    }
  }

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  return (
    <FunnelFlowBody>
      {generalData && resourcesData && (
        <StepSummary
          isLoadingCreate={loadingCreate}
          isLoadingCreateAndDeploy={loadingCreateAndDeploy}
          onSubmit={onSubmit}
          onPrevious={onBack}
          generalData={generalData}
          resourcesData={resourcesData}
          gotoResources={gotoResources}
          gotoGlobalInformation={gotoGlobalInformations}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
