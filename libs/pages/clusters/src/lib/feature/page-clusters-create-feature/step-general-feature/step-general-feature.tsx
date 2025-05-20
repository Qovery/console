import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCloudProviderCredentials, useCloudProviders } from '@qovery/domains/cloud-providers/feature'
import { type ClusterGeneralData } from '@qovery/shared/interfaces'
import {
  CLUSTERS_CREATION_FEATURES_URL,
  CLUSTERS_CREATION_KUBECONFIG_URL,
  CLUSTERS_CREATION_RESOURCES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepGeneral from '../../../ui/page-clusters-create/step-general/step-general'
import { useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Cluster')
  const { setGeneralData, generalData, setCurrentStep, setResourcesData, creationFlowUrl } =
    useClusterContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()
  const methods = useForm<ClusterGeneralData>({
    defaultValues: { installation_type: 'LOCAL_DEMO', production: false, ...generalData },
    mode: 'onChange',
  })

  const { data: cloudProviders = [] } = useCloudProviders()
  const { data: credentials = [] } = useCloudProviderCredentials({
    organizationId,
    cloudProvider: methods.getValues('cloud_provider'),
  })

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const onSubmit = methods.handleSubmit((data) => {
    setResourcesData((d) => ({
      cluster_type: d?.cluster_type ?? '',
      disk_size: d?.disk_size ?? 50,
      instance_type: d?.instance_type ?? '',
      nodes: d?.nodes ?? [3, 10],
      karpenter: {
        enabled: match(data)
          .with({ cloud_provider: 'AWS', production: false }, () => true)
          .otherwise(() => false),
        default_service_architecture: 'AMD64',
        disk_size_in_gib: 50,
        spot_enabled: false,
        qovery_node_pools: {
          requirements: [],
        },
      },
    }))

    if (credentials.length > 0) {
      // necessary to get the name of credentials
      const currentCredentials = credentials?.filter((item) => item.id === data['credentials'])[0]
      data['credentials_name'] = currentCredentials.name

      setGeneralData(data)
      match(data)
        .with({ installation_type: 'SELF_MANAGED' }, () => navigate(creationFlowUrl + CLUSTERS_CREATION_KUBECONFIG_URL))
        .with({ installation_type: 'MANAGED', cloud_provider: 'GCP' }, () =>
          navigate(creationFlowUrl + CLUSTERS_CREATION_FEATURES_URL)
        )
        .otherwise(() => navigate(creationFlowUrl + CLUSTERS_CREATION_RESOURCES_URL))
    }
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepGeneral
          onSubmit={onSubmit}
          cloudProviders={cloudProviders}
          currentCloudProvider={generalData?.cloud_provider}
          setResourcesData={setResourcesData}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature
