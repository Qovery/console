import { type ClusterFeatureGcpExistingVpc } from 'qovery-typescript-axios'
import { EmptyState, ExternalLink, InputText } from '@qovery/shared/ui'

export interface GcpExistingVPCProps {
  feature: ClusterFeatureGcpExistingVpc
}

export function GcpExistingVPC({ feature }: GcpExistingVPCProps) {
  if (feature.vpc_name === '') return <EmptyState title="No feature configured" />

  return (
    <div className="flex flex-col gap-4 justify-between p-4 rounded border bg-neutral-100 border-neutral-250">
      <div>
        <h4 className="text-neutral-400 text-sm font-medium">Deploy on an existing VPC</h4>
        <ExternalLink
          size="xs"
          href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#use-existing-vpc"
        >
          How to configure your VPC
        </ExternalLink>
      </div>
      <InputText name="vpc_id" label="VPC Name" value={feature.vpc_name} disabled />
      {feature.vpc_project_id && (
        <InputText name="vpc_project_id" label="External project id" value={feature.vpc_project_id} disabled />
      )}
      {feature.subnetwork_name && (
        <InputText name="subnetwork_name" label="Subnetwork range name" value={feature.subnetwork_name} disabled />
      )}
      {feature.ip_range_pods_name && (
        <InputText
          name="ip_range_pods_name"
          label="Pod IPv4 address range name"
          value={feature.ip_range_pods_name}
          disabled
        />
      )}
      {feature.additional_ip_range_pods_names && (
        <InputText
          name="additional_ip_range_pods_names"
          label="Additional cluster Pod IPv4 ranges names"
          value={feature.additional_ip_range_pods_names.join()}
          disabled
        />
      )}
      {feature.ip_range_services_name && (
        <InputText
          name="ip_range_services_name"
          label="IPv4 service range name"
          value={feature.ip_range_services_name}
          disabled
        />
      )}
    </div>
  )
}

export default GcpExistingVPC
