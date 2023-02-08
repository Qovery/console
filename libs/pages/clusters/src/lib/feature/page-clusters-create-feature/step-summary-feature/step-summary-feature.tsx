import {
  CloudProviderEnum,
  ClusterInstanceTypeResponseListResults,
  ClusterRequest,
  ClusterRequestFeatures,
  KubernetesEnum,
} from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createCluster,
  postCloudProviderInfo,
  postClusterActionsDeploy,
  selectInstancesTypes,
} from '@qovery/domains/organization'
import {
  CLUSTERS_CREATION_FEATURES_URL,
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_REMOTE_URL,
  CLUSTERS_CREATION_RESOURCES_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import StepSummary from '../../../ui/page-clusters-create/step-summary/step-summary'
import { steps, useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Database')
  const { generalData, resourcesData, featuresData, remoteData, setCurrentStep } = useClusterContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingCreateAndDeploy, setLoadingCreateAndDeploy] = useState(false)

  const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`

  const detailInstanceType = useSelector<RootState, ClusterInstanceTypeResponseListResults[] | undefined>((state) =>
    selectInstancesTypes(
      state,
      generalData?.cloud_provider || CloudProviderEnum.AWS,
      resourcesData?.cluster_type as KubernetesEnum,
      generalData?.region || ''
    )
  )?.find(
    (instanceTypes: ClusterInstanceTypeResponseListResults) => instanceTypes.type === resourcesData?.instance_type
  )

  const goToFeatures = useCallback(() => {
    navigate(pathCreate + CLUSTERS_CREATION_FEATURES_URL)
  }, [navigate, pathCreate])

  const goToGeneral = () => {
    navigate(pathCreate + CLUSTERS_CREATION_GENERAL_URL)
  }

  const goToResources = () => {
    navigate(pathCreate + CLUSTERS_CREATION_RESOURCES_URL)
  }

  const goToRemote = () => {
    navigate(pathCreate + CLUSTERS_CREATION_REMOTE_URL)
  }

  const onBack = () => {
    if (generalData?.cloud_provider === CloudProviderEnum.AWS) {
      if (resourcesData?.cluster_type === KubernetesEnum.K3_S) {
        goToRemote()
      } else {
        goToFeatures()
      }
    } else {
      goToResources()
    }
  }

  useEffect(() => {
    !generalData?.name && navigate(pathCreate + CLUSTERS_CREATION_GENERAL_URL)
  }, [pathCreate, generalData, navigate, organizationId])

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = (withDeploy: boolean) => {
    if (generalData && resourcesData) {
      if (withDeploy) setLoadingCreateAndDeploy(true)
      else setLoadingCreate(true)

      const formatFeatures =
        featuresData &&
        Object.keys(featuresData)
          .map(
            (id: string) =>
              featuresData[id].value && {
                id: id,
                value: featuresData[id].extendedValue || featuresData[id].value,
              }
          )
          .filter(Boolean)

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
        kubernetes: resourcesData.cluster_type as KubernetesEnum,
        features: formatFeatures as ClusterRequestFeatures[],
        ssh_keys: remoteData?.ssh_key ? [remoteData?.ssh_key] : undefined,
      }

      dispatch(
        createCluster({
          organizationId,
          clusterRequest,
        })
      )
        .unwrap()
        .then((cluster) => {
          // post cloud provider info
          dispatch(
            postCloudProviderInfo({
              organizationId,
              clusterId: cluster.id,
              clusterCloudProviderInfo: {
                cloud_provider: generalData.cloud_provider,
                credentials: {
                  id: generalData.credentials,
                  name: generalData.credentials_name,
                },
                region: generalData.region,
              },
            })
          )
            .unwrap()
            .then(() => {
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
        })
        .catch((e) => console.error(e))
        .finally(() => {
          if (withDeploy) setLoadingCreateAndDeploy(false)
          else setLoadingCreate(false)
        })
    }
  }

  useEffect(() => {
    setCurrentStep(
      steps(generalData?.cloud_provider, resourcesData?.cluster_type).findIndex((step) => step.key === 'summary') + 1
    )
  }, [setCurrentStep, generalData?.cloud_provider, resourcesData?.cluster_type])

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
          featuresData={featuresData}
          remoteData={remoteData}
          detailInstanceType={detailInstanceType}
          goToResources={goToResources}
          goToGeneral={goToGeneral}
          goToFeatures={goToFeatures}
          goToRemote={goToRemote}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
