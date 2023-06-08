import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterResourcesData } from '@qovery/shared/interfaces'
import {
  CLUSTERS_CREATION_FEATURES_URL,
  CLUSTERS_CREATION_REMOTE_URL,
  CLUSTERS_CREATION_SUMMARY_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import StepResources from '../../../ui/page-clusters-create/step-resources/step-resources'
import { steps, useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepResourcesFeature() {
  useDocumentTitle('Resources - Create Cluster')
  const { setResourcesData, resourcesData, setRemoteData, setFeaturesData, setCurrentStep, generalData } =
    useClusterContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Cluster"
      items={[
        'A Kubernetes cluster is necessary to run your application and the Qovery services',
        'Since it runs on your cloud provider account, credentials are necessary to create and manage the cluster and the applications that will run on it',
        'The production flag allows to easily identify if you are running your production environment on this cluster',
      ]}
      helpSectionProps={{
        description: 'Need help? You may find these links useful',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#managing-your-clusters-with-qovery',
            linkLabel: 'How to configure my cluster',
            external: true,
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum', external: true },
        ],
      }}
    />
  )

  useEffect(() => {
    setCurrentStep(
      steps(generalData?.cloud_provider, resourcesData?.cluster_type).findIndex((step) => step.key === 'resources') + 1
    )
  }, [setCurrentStep, generalData?.cloud_provider, resourcesData?.cluster_type])

  const methods = useForm<ClusterResourcesData>({
    defaultValues: resourcesData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (data.cluster_type === KubernetesEnum.K3_S) {
      data['nodes'] = [1, 1]
      setResourcesData(data)
    } else {
      setResourcesData(data)
    }

    const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`

    if (generalData?.cloud_provider === CloudProviderEnum.AWS) {
      if (data.cluster_type === KubernetesEnum.K3_S) {
        navigate(pathCreate + CLUSTERS_CREATION_REMOTE_URL)
        setFeaturesData(undefined)
      } else {
        navigate(pathCreate + CLUSTERS_CREATION_FEATURES_URL)
        setRemoteData({
          ssh_key: '',
        })
      }
    } else {
      navigate(pathCreate + CLUSTERS_CREATION_SUMMARY_URL)
      setRemoteData({
        ssh_key: '',
      })
      setFeaturesData(undefined)
    }
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepResources
          onSubmit={onSubmit}
          cloudProvider={generalData?.cloud_provider}
          clusterRegion={generalData?.region}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepResourcesFeature
