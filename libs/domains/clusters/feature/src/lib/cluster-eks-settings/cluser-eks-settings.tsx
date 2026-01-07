import { Controller } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { Heading, InputText, Section } from '@qovery/shared/ui'

export const ClusterEksSettings = () => {
  const { control } = useFormContext()

  return (
    <>
      <Section className="gap-4">
        <div className="space-y-1">
          <Heading level={2}>Cert Manager</Heading>
          <p className="text-sm text-neutral-subtle">Configure the certificate manager for your EKS cluster.</p>
        </div>
        <Controller
          name="infrastructure_charts_parameters.cert_manager_parameters.kubernetes_namespace"
          control={control}
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
          <p className="text-sm text-neutral-subtle">Configure your load-balancer (using MetalLB)</p>
        </div>
        <Controller
          name="infrastructure_charts_parameters.metal_lb_parameters.ip_address_pools"
          control={control}
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
          <p className="text-sm text-neutral-subtle">Configure Nginx for your EKS cluster.</p>
        </div>

        <Controller
          name="infrastructure_charts_parameters.nginx_parameters.replica_count"
          control={control}
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
          name="infrastructure_charts_parameters.nginx_parameters.default_ssl_certificate"
          control={control}
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
          name="infrastructure_charts_parameters.nginx_parameters.publish_status_address"
          control={control}
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
          name="infrastructure_charts_parameters.nginx_parameters.annotation_metal_lb_load_balancer_ips"
          control={control}
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
          name="infrastructure_charts_parameters.nginx_parameters.annotation_external_dns_kubernetes_target"
          control={control}
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
    </>
  )
}
