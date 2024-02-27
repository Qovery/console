import { type CloudProviderEnum, type ClusterFeature, type ClusterFeatureAwsExistingVpc } from 'qovery-typescript-axios'
import { CardClusterFeature } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import { BlockContent, Heading, HelpSection, Icon, InputText, LoaderSpinner, Section } from '@qovery/shared/ui'

export interface PageSettingsFeaturesProps {
  loading: boolean
  features?: ClusterFeature[]
  cloudProvider?: CloudProviderEnum
}

function Subnets({ title, value }: { title: string; value?: string[] | null }) {
  return (
    <li className="flex flex-col text-xs gap-1">
      <span className="font-medium">{title}</span>
      {value ? (
        value.map((subnetId: string, index: number) => <span key={index}>{subnetId}</span>)
      ) : (
        <span>Not defined</span>
      )}
    </li>
  )
}

export function PageSettingsFeatures(props: PageSettingsFeaturesProps) {
  const { loading, features, cloudProvider } = props

  const featureExistingVpc = features?.find(({ id }) => id === 'EXISTING_VPC')
  const featureExistingVpcValue = featureExistingVpc?.value as ClusterFeatureAwsExistingVpc

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-8">Features</Heading>

        {!loading && featureExistingVpcValue && (
          <div className="flex flex-col justify-between p-4 rounded border bg-neutral-100 border-neutral-250 mb-5">
            <h4 className="text-neutral-400 text-sm font-medium mb-1">Deploy on an existing VPC</h4>
            <p className="text-neutral-350 text-sm mb-4">In your VPC settings, you have enable the DNS hostnames.</p>
            <InputText
              name="vpc_id"
              label="VPC ID"
              value={featureExistingVpcValue.aws_vpc_eks_id}
              className="mb-4"
              disabled
            />
            <ul className="grid gap-4">
              <li className="text-neutral-400">
                <span className="flex items-center font-medium text-xs mb-1">
                  <Icon name={IconEnum.EKS} width="16" className="mr-2" />
                  EKS subnet IDs
                </span>
                <ul className="grid grid-cols-3 gap-4">
                  <Subnets title="Zone A:" value={featureExistingVpcValue.eks_subnets_zone_a_ids} />
                  <Subnets title="Zone B:" value={featureExistingVpcValue.eks_subnets_zone_b_ids} />
                  <Subnets title="Zone C:" value={featureExistingVpcValue.eks_subnets_zone_c_ids} />
                </ul>
              </li>
              <li className="text-neutral-400">
                <span className="flex items-center font-medium text-xs mb-1">
                  <Icon name={IconEnum.MONGODB} width="16" className="mr-2" />
                  MongoDB subnet IDs
                </span>
                <ul className="grid grid-cols-3 gap-4">
                  <Subnets title="Zone A:" value={featureExistingVpcValue.documentdb_subnets_zone_a_ids} />
                  <Subnets title="Zone B:" value={featureExistingVpcValue.documentdb_subnets_zone_b_ids} />
                  <Subnets title="Zone C:" value={featureExistingVpcValue.documentdb_subnets_zone_c_ids} />
                </ul>
              </li>

              <li className="text-neutral-400">
                <span className="flex items-center font-medium text-xs mb-1">
                  <Icon name={IconEnum.REDIS} width="16" className="mr-2" />
                  Redis subnet IDs
                </span>
                <ul className="grid grid-cols-3 gap-4">
                  <Subnets title="Zone A:" value={featureExistingVpcValue.elasticache_subnets_zone_a_ids} />
                  <Subnets title="Zone B:" value={featureExistingVpcValue.elasticache_subnets_zone_b_ids} />
                  <Subnets title="Zone C:" value={featureExistingVpcValue.elasticache_subnets_zone_c_ids} />
                </ul>
              </li>

              <li className="text-neutral-400">
                <span className="flex items-center font-medium text-xs mb-1">MySQL/PostgreSQL subnet IDs</span>
                <ul className="grid grid-cols-3 gap-4">
                  <Subnets title="Zone A:" value={featureExistingVpcValue.rds_subnets_zone_a_ids} />
                  <Subnets title="Zone B:" value={featureExistingVpcValue.rds_subnets_zone_b_ids} />
                  <Subnets title="Zone C:" value={featureExistingVpcValue.rds_subnets_zone_c_ids} />
                </ul>
              </li>
            </ul>
          </div>
        )}

        {!featureExistingVpc?.value && (
          <BlockContent title="Configured features" classNameContent="p-0">
            {loading && (
              <div className="flex justify-center p-5">
                <LoaderSpinner className="w-4" />
              </div>
            )}
            {features
              ?.filter(({ id }) => id !== 'EXISTING_VPC')
              .map((feature: ClusterFeature) => (
                <CardClusterFeature key={feature.id} feature={feature} cloudProvider={cloudProvider} disabled />
              ))}
          </BlockContent>
        )}
      </Section>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#creating-an-eks-cluster-multiple-node-cluster',
            linkLabel: 'How to configure my cluster',
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsFeatures
