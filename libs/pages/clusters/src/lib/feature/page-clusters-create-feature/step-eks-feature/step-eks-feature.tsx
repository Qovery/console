import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { SCW_CONTROL_PLANE_FEATURE_ID } from '@qovery/domains/cloud-providers/feature'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import {
  CLUSTERS_CREATION_FEATURES_URL,
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_SUMMARY_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_URL,
} from '@qovery/shared/routes'
import { Button, FunnelFlowBody, Heading, InputText, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepEKSFeature() {
  useDocumentTitle('EKS configuration - Create Cluster')
  const { organizationId = '' } = useParams()
  const { setResourcesData, resourcesData, setFeaturesData, setCurrentStep, generalData, creationFlowUrl } =
    useClusterContainerCreateContext()
  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const methods = useForm<ClusterResourcesData>({
    defaultValues: resourcesData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setResourcesData(data)

    navigate(creationFlowUrl + CLUSTERS_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <Section>
          <div className="mb-10 flex flex-col gap-2">
            <Heading>EKS configuration</Heading>
            <p className="text-sm text-neutral-350">Configure your EKS cluster to use the Qovery platform.</p>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-10">
              <Section className="gap-4">
                <div className="space-y-1">
                  <Heading level={2}>Certificate manager</Heading>
                  <p className="text-sm text-neutral-350">Configure the certificate manager for your EKS cluster.</p>
                </div>
                <Controller
                  name="kubernetes_namespace"
                  control={methods.control}
                  rules={{
                    required: 'Please enter a Kubernetes namespace.',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      dataTestId="input-kubernetes-namespace"
                      name={field.name}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                      }}
                      label="Kubernetes namespace"
                      error={error?.message}
                    />
                  )}
                />
              </Section>

              <Section className="gap-4">
                <div className="space-y-1">
                  <Heading level={2}>MetalLB</Heading>
                  <p className="text-sm text-neutral-350">Configure your load-balancer (using MetalLB)</p>
                </div>
                <Controller
                  name="ip_address_pools"
                  control={methods.control}
                  rules={{
                    required: 'Please enter a IP address pool.',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      dataTestId="input-ip-address-pools"
                      name={field.name}
                      onChange={(e) => {
                        field.onChange(e.target.value.split(',').map((item) => item.trim()))
                      }}
                      value={field.value?.join(', ')}
                      label="Load-balancer IP pools"
                      hint="Enter the IP pools that the load-balancer will use. Separate each IP pool with a comma."
                      error={error?.message}
                    />
                  )}
                />
              </Section>

              <Section className="gap-4">
                <div className="space-y-1">
                  <Heading level={2}>Nginx</Heading>
                  <p className="text-sm text-neutral-350">Configure Nginx for your EKS cluster.</p>
                </div>

                <Controller
                  name="replica_count"
                  control={methods.control}
                  rules={{
                    required: 'Please enter a number of replicas.',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      dataTestId="input-replica-count"
                      type="number"
                      name={field.name}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                      }}
                      label="Number of replicas"
                      error={error?.message}
                    />
                  )}
                />
                <Controller
                  name="default_ssl_certificate"
                  control={methods.control}
                  rules={{
                    required: 'Please enter a default SSL certificate.',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      dataTestId="input-default-ssl-certificate"
                      type="text"
                      name={field.name}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                      }}
                      label="Default SSL certificate"
                      error={error?.message}
                    />
                  )}
                />
                <Controller
                  name="publish_status_address"
                  control={methods.control}
                  rules={{
                    required: 'Please enter a publish status address.',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      dataTestId="input-publish-status-address"
                      type="text"
                      name={field.name}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                      }}
                      label="Publish status address"
                      error={error?.message}
                    />
                  )}
                />
                <Controller
                  name="annotation_metal_lb_load_balancer_ips"
                  control={methods.control}
                  rules={{
                    required: 'Please enter a annotation Metal LB load balancer IPs.',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      dataTestId="input-annotation-metal-lb-load-balancer-ips"
                      type="text"
                      name={field.name}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                      }}
                      label="Annotation Metal LB load balancer IPs"
                      error={error?.message}
                    />
                  )}
                />
                <Controller
                  name="annotation_external_dns_kubernetes_target"
                  control={methods.control}
                  rules={{
                    required: 'Please enter a annotation External DNS Kubernetes target.',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      dataTestId="input-annotation-external-dns-kubernetes-target"
                      type="text"
                      name={field.name}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                      }}
                      label="Annotation External DNS Kubernetes target"
                      error={error?.message}
                    />
                  )}
                />
              </Section>

              <div className="flex justify-between">
                <Button
                  onClick={() =>
                    navigate(`${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}${CLUSTERS_CREATION_GENERAL_URL}`)
                  }
                  type="button"
                  variant="plain"
                  size="lg"
                >
                  Back
                </Button>
                <Button data-testid="button-submit" type="submit" disabled={!methods.formState.isValid} size="lg">
                  Continue
                </Button>
              </div>
            </div>
          </form>
        </Section>
      </FormProvider>
    </FunnelFlowBody>
  )
}
