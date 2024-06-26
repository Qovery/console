import { type ClusterFeatureAwsExistingVpc } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { Icon, InputText } from '@qovery/shared/ui'

export interface AWSExistingVPCProps {
  feature: ClusterFeatureAwsExistingVpc
}

function Subnets({ title, value }: { title: string; value?: string[] | null }) {
  return (
    <li className="flex flex-col gap-1 text-xs">
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
    <div className="mb-5 flex flex-col justify-between rounded border border-neutral-250 bg-neutral-100 p-4">
      <h4 className="mb-1 text-sm font-medium text-neutral-400">Deploy on an existing VPC</h4>
      <p className="mb-4 text-sm text-neutral-350">In your VPC settings, you have to enable DNS hostnames.</p>
      <InputText name="vpc_id" label="VPC ID" value={feature.aws_vpc_eks_id} className="mb-4" disabled />
      <ul className="grid gap-4">
        <li className="text-neutral-400">
          <span className="mb-1 flex items-center text-xs font-medium">
            <Icon name={IconEnum.EKS} width="16" className="mr-2" />
            EKS public subnet IDs
          </span>
          <ul className="grid grid-cols-3 gap-4">
            <Subnets title="Zone A:" value={feature.eks_subnets_zone_a_ids} />
            <Subnets title="Zone B:" value={feature.eks_subnets_zone_b_ids} />
            <Subnets title="Zone C:" value={feature.eks_subnets_zone_c_ids} />
          </ul>
        </li>

        <li className="text-neutral-400">
          <span className="mb-1 flex items-center text-xs font-medium">
            <Icon name={IconEnum.EKS} width="16" className="mr-2" />
            EKS private subnet IDs
          </span>
          <ul className="grid grid-cols-3 gap-4">
            <Subnets title="Zone A:" value={feature.eks_karpenter_fargate_subnets_zone_a_ids} />
            <Subnets title="Zone B:" value={feature.eks_karpenter_fargate_subnets_zone_b_ids} />
            <Subnets title="Zone C:" value={feature.eks_karpenter_fargate_subnets_zone_c_ids} />
          </ul>
        </li>

        <li className="text-neutral-400">
          <span className="mb-1 flex items-center text-xs font-medium">
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
          <span className="mb-1 flex items-center text-xs font-medium">
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
          <span className="mb-1 flex items-center text-xs font-medium">MySQL/PostgreSQL subnet IDs</span>
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
