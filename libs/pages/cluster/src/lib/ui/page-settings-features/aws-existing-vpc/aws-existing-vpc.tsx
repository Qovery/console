import { type ClusterFeatureAwsExistingVpc } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { Icon, InputText } from '@qovery/shared/ui'

export interface AWSExistingVPCProps {
  feature: ClusterFeatureAwsExistingVpc
}

function Subnets({ title, value }: { title: string; value?: string[] | null }) {
  return (
    <li className="flex flex-col text-xs gap-1">
      <span className="font-medium">{title}</span>
      {value && value.length > 0 ? (
        value.map((subnetId: string, index: number) => <span key={index}>{subnetId}</span>)
      ) : (
        <span>Not defined</span>
      )}
    </li>
  )
}

export function AWSExistingVPC({ feature }: AWSExistingVPCProps) {
  return (
    <div className="flex flex-col justify-between p-4 rounded border bg-neutral-100 border-neutral-250 mb-5">
      <h4 className="text-neutral-400 text-sm font-medium mb-1">Deploy on an existing VPC</h4>
      <p className="text-neutral-350 text-sm mb-4">In your VPC settings, you have to enable DNS hostnames.</p>
      <InputText name="vpc_id" label="VPC ID" value={feature.aws_vpc_eks_id} className="mb-4" disabled />
      <ul className="grid gap-4">
        <li className="text-neutral-400">
          <span className="flex items-center font-medium text-xs mb-1">
            <Icon name={IconEnum.EKS} width="16" className="mr-2" />
            EKS subnet IDs
          </span>
          <ul className="grid grid-cols-3 gap-4">
            <Subnets title="Zone A:" value={feature.eks_subnets_zone_a_ids} />
            <Subnets title="Zone B:" value={feature.eks_subnets_zone_b_ids} />
            <Subnets title="Zone C:" value={feature.eks_subnets_zone_c_ids} />
          </ul>
        </li>

        <li className="text-neutral-400">
          <span className="flex items-center font-medium text-xs mb-1">
            <Icon name={IconEnum.MONGODB} width="16" className="mr-2" />
            MongoDB subnet IDs
          </span>
          <ul className="grid grid-cols-3 gap-4">
            <Subnets title="Zone A:" value={feature.documentdb_subnets_zone_a_ids} />
            <Subnets title="Zone B:" value={feature.documentdb_subnets_zone_b_ids} />
            <Subnets title="Zone C:" value={feature.documentdb_subnets_zone_c_ids} />
          </ul>
        </li>

        <li className="text-neutral-400">
          <span className="flex items-center font-medium text-xs mb-1">
            <Icon name={IconEnum.REDIS} width="16" className="mr-2" />
            Redis subnet IDs
          </span>
          <ul className="grid grid-cols-3 gap-4">
            <Subnets title="Zone A:" value={feature.elasticache_subnets_zone_a_ids} />
            <Subnets title="Zone B:" value={feature.elasticache_subnets_zone_b_ids} />
            <Subnets title="Zone C:" value={feature.elasticache_subnets_zone_c_ids} />
          </ul>
        </li>

        <li className="text-neutral-400">
          <span className="flex items-center font-medium text-xs mb-1">MySQL/PostgreSQL subnet IDs</span>
          <ul className="grid grid-cols-3 gap-4">
            <Subnets title="Zone A:" value={feature.rds_subnets_zone_a_ids} />
            <Subnets title="Zone B:" value={feature.rds_subnets_zone_b_ids} />
            <Subnets title="Zone C:" value={feature.rds_subnets_zone_c_ids} />
          </ul>
        </li>
      </ul>
    </div>
  )
}

export default AWSExistingVPC
