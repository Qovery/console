import { type ReactNode } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Heading, InputText, InputToggle, Section } from '@qovery/shared/ui'
import { type ClusterEksSettingsFormData } from './cluster-eks-settings-form.utils'

export interface ClusterEksSettingsProps {
  gitSettings?: ReactNode
}

export const ClusterEksSettings = ({ gitSettings }: ClusterEksSettingsProps) => {
  const { control } = useFormContext<ClusterEksSettingsFormData>()
  const backupEnabled = useWatch({
    control,
    name: 'infrastructure_charts_parameters.eks_anywhere_parameters.cluster_backup.enabled',
  })

  return (
    <>
      <Section className="gap-4">
        <div className="space-y-1">
          <Heading>Infrastructure charts source</Heading>
          <p className="text-sm text-neutral-subtle">
            Configure the git repository and YAML file path used for your EKS Anywhere.
          </p>
        </div>
        {gitSettings}
      </Section>

      <Section className="gap-4">
        <div className="space-y-1">
          <Heading>Backup</Heading>
          <p className="text-sm text-neutral-subtle">Configure the backup of your EKS Anywhere cluster.</p>
        </div>

        <Controller
          name="infrastructure_charts_parameters.eks_anywhere_parameters.cluster_backup.enabled"
          control={control}
          render={({ field }) => (
            <InputToggle
              name={field.name}
              value={field.value ?? false}
              onChange={field.onChange}
              title="Enable backup"
              description="Enable periodic backup of the EKS Anywhere cluster state to S3."
            />
          )}
        />

        {backupEnabled && (
          <>
            <div className="space-y-1">
              <Heading>S3</Heading>
              <p className="text-sm text-neutral-subtle">S3 bucket configuration for backup artifacts.</p>
            </div>

            <Controller
              name="infrastructure_charts_parameters.eks_anywhere_parameters.cluster_backup.s3.bucket"
              control={control}
              rules={{ required: 'Please enter a S3 bucket name.' }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  dataTestId="input-backup-s3-bucket"
                  type="text"
                  name={field.name}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                  }}
                  label="Bucket"
                  error={error?.message}
                />
              )}
            />

            <Controller
              name="infrastructure_charts_parameters.eks_anywhere_parameters.cluster_backup.s3.region"
              control={control}
              rules={{ required: 'Please enter a S3 region.' }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  dataTestId="input-backup-s3-region"
                  type="text"
                  name={field.name}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                  }}
                  label="Region"
                  error={error?.message}
                />
              )}
            />

            <Controller
              name="infrastructure_charts_parameters.eks_anywhere_parameters.cluster_backup.s3.role_arn"
              control={control}
              rules={{ required: 'Please enter an IAM role ARN.' }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  dataTestId="input-backup-s3-role-arn"
                  type="text"
                  name={field.name}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                  }}
                  label="Role ARN"
                  hint="IAM role ARN assumed to upload backup artifacts."
                  error={error?.message}
                />
              )}
            />

            <Controller
              name="infrastructure_charts_parameters.eks_anywhere_parameters.cluster_backup.s3.key_prefix"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  dataTestId="input-backup-s3-key-prefix"
                  type="text"
                  name={field.name}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                  }}
                  label="Key prefix"
                  hint="Optional S3 key prefix used for backup object keys."
                  error={error?.message}
                />
              )}
            />
          </>
        )}
      </Section>

      <Section className="gap-4">
        <div className="space-y-1">
          <Heading>Cert Manager</Heading>
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
          <Heading>MetalLB</Heading>
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
          <Heading>Nginx</Heading>
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
