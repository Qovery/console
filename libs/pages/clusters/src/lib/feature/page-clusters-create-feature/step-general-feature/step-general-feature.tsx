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
  CLUSTERS_CREATION_URL,
  CLUSTERS_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepGeneral from '../../../ui/page-clusters-create/step-general/step-general'
import { useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Cluster')
  const { setGeneralData, generalData, setCurrentStep, setResourcesData } = useClusterContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()
  const methods = useForm<ClusterGeneralData>({
    defaultValues: { installation_type: 'MANAGED', production: false, ...generalData },
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
    if (credentials.length > 0) {
      // necessary to get the name of credentials
      const currentCredentials = credentials?.filter((item) => item.id === data['credentials'])[0]

      data['credentials_name'] = currentCredentials.name

      setGeneralData(data)
      const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`
      match(data)
        .with({ installation_type: 'SELF_MANAGED' }, () => navigate(pathCreate + CLUSTERS_CREATION_KUBECONFIG_URL))
        .with({ installation_type: 'MANAGED', cloud_provider: 'GCP' }, () =>
          navigate(pathCreate + CLUSTERS_CREATION_FEATURES_URL)
        )
        .otherwise(() => navigate(pathCreate + CLUSTERS_CREATION_RESOURCES_URL))
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
