import { type ClusterFeatureGcpExistingVpc } from 'qovery-typescript-axios'
import { InputText } from '@qovery/shared/ui'

export interface GcpExistingVPCProps {
  feature: ClusterFeatureGcpExistingVpc
}

export function GcpExistingVPC(props: GcpExistingVPCProps) {
  const { feature } = props

  return (
    <div className="flex flex-col justify-between p-4 rounded border bg-neutral-100 border-neutral-250 mb-5">
      <h4 className="text-neutral-400 text-sm font-medium mb-4">Deploy on an existing VPC</h4>
      <InputText name="vpc_id" label="VPC Name" value={feature.vpc_name} className="mb-4" disabled />
      {feature.vpc_project_id && (
        <InputText name="vpc_project_id" label="External project id" value={feature.vpc_project_id} disabled />
      )}
      {feature.subnetwork_name && (
        <InputText
          name="subnetwork_name"
          className="mb-4"
          label="Subnetwork range name (optional)"
          value={feature.subnetwork_name}
        />
      )}
      {feature.ip_range_pods_name && (
        <InputText
          name="ip_range_pods_name"
          className="mb-4"
          label="Subnetwork range name (optional)"
          value={feature.ip_range_pods_name}
        />
      )}
      {feature.ip_range_pods_name && (
        <InputText
          name="ip_range_pods_name"
          className="mb-4"
          label="Additional cluster Pod IPv4 ranges names (separated with a comma) (optional)"
          value={feature.ip_range_pods_name}
        />
      )}

      {/* {openOptions && (
        <>
          <Controller
            name="gcp_existing_vpc.additional_ip_range_pods_names"
            rules={{
              pattern,
            }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-4"
                label="Additional cluster Pod IPv4 ranges names (separated with a comma) (optional)"
                name={field.name}
                value={field.value}
                error={error?.message}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="gcp_existing_vpc.ip_range_services_name"
            rules={{
              pattern,
            }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputText
                label="IPv4 service range name (optional)"
                name={field.name}
                value={field.value}
                error={error?.message}
                onChange={field.onChange}
              />
            )}
          />
        </> */}
      {/* )} */}
    </div>
  )
}

export default GcpExistingVPC
