import { type ClusterInstanceTypeResponseListResultsInner } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { KarpenterInstanceTypePreview } from '@qovery/domains/cloud-providers/feature'
import {
  type ClusterFeaturesData,
  type ClusterGeneralData,
  type ClusterKubeconfigData,
  type ClusterRemoteData,
  type ClusterResourcesData,
  type Subnets,
} from '@qovery/shared/interfaces'
import { Button, Callout, ExternalLink, Heading, Icon, Section } from '@qovery/shared/ui'
import { trimId } from '@qovery/shared/util-js'
import { getValueByKey } from '../../../feature/page-clusters-create-feature/step-summary-feature/step-summary-feature'

export interface StepSummaryProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: ClusterGeneralData
  kubeconfigData?: ClusterKubeconfigData
  resourcesData: ClusterResourcesData
  featuresData?: ClusterFeaturesData
  remoteData?: ClusterRemoteData
  goToFeatures: () => void
  goToResources: () => void
  goToKubeconfig: () => void
  goToGeneral: () => void
  goToRemote: () => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
  detailInstanceType?: ClusterInstanceTypeResponseListResultsInner
}

function SubnetsList({ title, index, subnets }: { title: string; index: string; subnets?: Subnets[] }) {
  if (!subnets) return null
  const value = getValueByKey(index, subnets)

  if (value[0]?.length === 0 || value.length === 0) return null

  return (
    <li>
      {title} <strong className="font-medium">{value.join(', ')}</strong>
    </li>
  )
}

export function StepSummary(props: StepSummaryProps) {
  const checkIfFeaturesAvailable = () => {
    const feature = []

    if (props.featuresData) {
      if (props.featuresData?.vpc_mode === 'EXISTING_VPC') return true

      for (let i = 0; i < Object.keys(props.featuresData.features).length; i++) {
        const id = Object.keys(props.featuresData.features)[i]
        const currentFeature = props.featuresData.features[id]
        if (currentFeature.value) feature.push(id)
      }
    }

    return feature.length > 0
  }

  const showFeaturesSection = match(props.generalData.cloud_provider)
    .with('AWS', 'GCP', () => checkIfFeaturesAvailable())
    .with('SCW', () => false)
    .otherwise(() => false)

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Ready to install your cluster</Heading>
        <p className="text-sm text-neutral-350">Here is what we will deploy, this action can take up to 30 minutes.</p>
      </div>

      <div className="mb-10">
        {props.generalData.installation_type === 'MANAGED' && (
          <Callout.Root color="sky" className="mb-5">
            <Callout.Icon>
              <Icon iconName="circle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Qovery manages this resource for you</Callout.TextHeading>
              <Callout.TextDescription>
                Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
                <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a
                drift in the configuration.
                <br />
                <ExternalLink
                  size="sm"
                  href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#how-does-qovery-handle-cluster-updates-and-upgrades"
                >
                  Click here for more details
                </ExternalLink>
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        )}
        <Section
          data-testid="summary-general"
          className="mb-2 flex w-full flex-row rounded border border-neutral-250 bg-neutral-100 p-4"
        >
          <div className="mr-2 flex-grow">
            <Heading className="mb-3">General information</Heading>
            <ul className="list-none space-y-2 text-sm text-neutral-400">
              <li>
                <strong className="font-medium">Installation type: </strong>
                {match(props.generalData.installation_type)
                  .with('MANAGED', () => 'Managed')
                  .with('SELF_MANAGED', () => 'Self-Managed')
                  .with('LOCAL_DEMO', () => undefined)
                  .exhaustive()}
              </li>
              <li>
                <strong className="font-medium">Cluster name: </strong>
                {props.generalData.name}
              </li>
              {props.generalData.production && (
                <li>
                  <strong className="font-medium">Production: </strong>true
                </li>
              )}
              <li>
                <strong className="font-medium">Provider: </strong>
                <span className="inline-flex items-center font-medium">
                  <Icon className="ml-1 w-4" name={props.generalData.cloud_provider} />
                </span>
              </li>
              <li>
                <strong className="font-medium">Region: </strong>
                {props.generalData.region}
              </li>
            </ul>
          </div>

          <Button type="button" variant="plain" size="md" onClick={props.goToGeneral}>
            <Icon className="text-base" iconName="gear-complex" />
          </Button>
        </Section>

        {match(props.generalData)
          .with(
            { installation_type: 'MANAGED', cloud_provider: 'AWS' },
            { installation_type: 'MANAGED', cloud_provider: 'SCW' },
            () => (
              <Section
                data-testid="summary-resources"
                className="mb-2 flex w-full flex-row rounded border border-neutral-250 bg-neutral-100 p-4"
              >
                <div className="mr-2 flex-grow">
                  <Heading className="mb-3">Resources</Heading>
                  <ul className="list-none space-y-2 text-sm text-neutral-400">
                    <li>
                      <strong className="font-medium">Cluster type: </strong>
                      {props.resourcesData.cluster_type}
                    </li>
                    {!props.resourcesData.karpenter?.enabled ? (
                      <>
                        <li>
                          <strong className="font-medium">Instance type: </strong>
                          {props.detailInstanceType?.name} ({props.detailInstanceType?.cpu}CPU -{' '}
                          {props.detailInstanceType?.ram_in_gb}GB RAM - {props.detailInstanceType?.architecture})
                        </li>
                        <li>
                          <strong className="font-medium">Disk size: </strong> {props.resourcesData.disk_size} GB
                        </li>
                        <li>
                          <strong className="font-medium">Nodes: </strong>
                          {props.resourcesData.nodes[0]} min - {props.resourcesData.nodes[1]} max
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <strong className="font-medium">Karpenter: </strong>true
                        </li>
                        <li>
                          <strong className="font-medium">Storage: </strong>
                          {props.resourcesData.karpenter?.disk_size_in_gib} GB
                        </li>
                        <li>
                          <KarpenterInstanceTypePreview
                            className="gap-2"
                            defaultServiceArchitecture={props.resourcesData.karpenter?.default_service_architecture}
                            requirements={props.resourcesData.karpenter.qovery_node_pools?.requirements}
                          />
                        </li>
                        <li>
                          <strong className="font-medium">Spot instances: </strong>
                          {(props.resourcesData.karpenter?.spot_enabled ?? false).toString()}
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                <Button type="button" variant="plain" size="md" onClick={props.goToResources}>
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </Section>
            )
          )
          .with({ installation_type: 'SELF_MANAGED' }, () => (
            <Section
              data-testid="summary-kubeconfig"
              className="mb-2 flex w-full flex-row rounded border border-neutral-250 bg-neutral-100 p-4"
            >
              <div className="mr-2 flex-grow">
                <Heading className="mb-3">Kubeconfig</Heading>
                <ul className="list-none text-sm text-neutral-400">
                  <li>
                    <strong className="font-medium">Kubeconfig: </strong>
                    {props.kubeconfigData?.file_name}
                  </li>
                </ul>
              </div>
              <Button type="button" variant="plain" size="md" onClick={props.goToKubeconfig}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </Section>
          ))
          .otherwise(() => null)}

        {props.remoteData && props.remoteData.ssh_key.length > 0 && (
          <Section
            data-testid="summary-remote"
            className="mb-2 flex w-full flex-row rounded border border-neutral-250 bg-neutral-100 p-4"
          >
            <div className="mr-2 flex-grow">
              <Heading className="mb-3">Remote access</Heading>
              <ul className="list-none text-sm text-neutral-400">
                <li>
                  <strong className="font-medium">SSH key: </strong>
                  {trimId(props.remoteData.ssh_key, 'both')}
                </li>
              </ul>
            </div>
            <Button type="button" variant="plain" size="md" onClick={props.goToRemote}>
              <Icon className="text-base" iconName="gear-complex" />
            </Button>
          </Section>
        )}

        {props.featuresData && showFeaturesSection && (
          <Section
            data-testid="summary-features"
            className="mb-2 flex w-full flex-row rounded border border-neutral-250 bg-neutral-100 p-4"
          >
            <div className="mr-2 flex-grow">
              <Heading className="mb-3">Features</Heading>
              <ul className="list-none space-y-2 text-sm text-neutral-400">
                {props.featuresData.aws_existing_vpc && (
                  <>
                    <li className="mb-3">
                      <strong className="font-medium">VPC ID: </strong>
                      {props.featuresData.aws_existing_vpc.aws_vpc_eks_id}
                    </li>
                    {props.featuresData.aws_existing_vpc.eks_subnets?.length !== 0 && (
                      <li className="mb-3">
                        <strong className="font-medium">EKS public subnet IDs: </strong>
                        <ul className="ml-4 list-disc">
                          <SubnetsList
                            title="zone A:"
                            index="A"
                            subnets={props.featuresData.aws_existing_vpc.eks_subnets}
                          />
                          <SubnetsList
                            title="zone B:"
                            index="B"
                            subnets={props.featuresData.aws_existing_vpc.eks_subnets}
                          />
                          <SubnetsList
                            title="zone C:"
                            index="C"
                            subnets={props.featuresData.aws_existing_vpc.eks_subnets}
                          />
                        </ul>
                      </li>
                    )}
                    {props.featuresData.aws_existing_vpc.eks_karpenter_fargate_subnets &&
                      props.featuresData.aws_existing_vpc.eks_karpenter_fargate_subnets?.length !== 0 && (
                        <li className="mb-3">
                          <strong className="font-medium">EKS private subnet IDs: </strong>
                          <ul className="ml-4 list-disc">
                            <SubnetsList
                              title="zone A:"
                              index="A"
                              subnets={props.featuresData.aws_existing_vpc.eks_karpenter_fargate_subnets}
                            />
                            <SubnetsList
                              title="zone B:"
                              index="B"
                              subnets={props.featuresData.aws_existing_vpc.eks_karpenter_fargate_subnets}
                            />
                            <SubnetsList
                              title="zone C:"
                              index="C"
                              subnets={props.featuresData.aws_existing_vpc.eks_karpenter_fargate_subnets}
                            />
                          </ul>
                        </li>
                      )}
                    {props.featuresData.aws_existing_vpc.mongodb_subnets?.length !== 0 && (
                      <li className="mb-3">
                        <strong className="font-medium">MongoDB subnet IDs: </strong>
                        <ul className="ml-4 list-disc">
                          <SubnetsList
                            title="zone A:"
                            index="A"
                            subnets={props.featuresData.aws_existing_vpc.mongodb_subnets}
                          />
                          <SubnetsList
                            title="zone B:"
                            index="B"
                            subnets={props.featuresData.aws_existing_vpc.mongodb_subnets}
                          />
                          <SubnetsList
                            title="zone C:"
                            index="C"
                            subnets={props.featuresData.aws_existing_vpc.mongodb_subnets}
                          />
                        </ul>
                      </li>
                    )}
                    {props.featuresData.aws_existing_vpc.redis_subnets?.length !== 0 && (
                      <li className="mb-3">
                        <strong className="font-medium">Redis subnet IDs: </strong>
                        <ul className="ml-4 list-disc">
                          <SubnetsList
                            title="zone A:"
                            index="A"
                            subnets={props.featuresData.aws_existing_vpc.redis_subnets}
                          />
                          <SubnetsList
                            title="zone B:"
                            index="B"
                            subnets={props.featuresData.aws_existing_vpc.redis_subnets}
                          />
                          <SubnetsList
                            title="zone C:"
                            index="C"
                            subnets={props.featuresData.aws_existing_vpc.redis_subnets}
                          />
                        </ul>
                      </li>
                    )}
                    {props.featuresData.aws_existing_vpc.rds_subnets?.length !== 0 && (
                      <li className="mb-3">
                        <strong className="font-medium">MySQL/PostgreSQL subnet IDs: </strong>
                        <ul className="ml-4 list-disc">
                          <SubnetsList
                            title="zone A:"
                            index="A"
                            subnets={props.featuresData.aws_existing_vpc.rds_subnets}
                          />
                          <SubnetsList
                            title="zone B:"
                            index="B"
                            subnets={props.featuresData.aws_existing_vpc.rds_subnets}
                          />
                          <SubnetsList
                            title="zone C:"
                            index="C"
                            subnets={props.featuresData.aws_existing_vpc.rds_subnets}
                          />
                        </ul>
                      </li>
                    )}
                  </>
                )}
                {props.featuresData.gcp_existing_vpc && (
                  <>
                    <li>
                      <strong className="font-medium">VPC name: </strong>
                      {props.featuresData.gcp_existing_vpc.vpc_name}
                    </li>
                    {props.featuresData.gcp_existing_vpc.vpc_project_id && (
                      <li>
                        <strong className="font-medium">VPC Project ID: </strong>
                        {props.featuresData.gcp_existing_vpc.vpc_project_id}
                      </li>
                    )}
                    {props.featuresData.gcp_existing_vpc.subnetwork_name && (
                      <li>
                        <strong className="font-medium">Subnetwork range name: </strong>
                        {props.featuresData.gcp_existing_vpc.subnetwork_name}
                      </li>
                    )}
                    {props.featuresData.gcp_existing_vpc.ip_range_pods_name && (
                      <li>
                        <strong className="font-medium">Pod IPv4 address range name: </strong>
                        {props.featuresData.gcp_existing_vpc.ip_range_pods_name}
                      </li>
                    )}
                    {props.featuresData.gcp_existing_vpc.additional_ip_range_pods_names && (
                      <li>
                        <strong className="font-medium">Cluster Pod IPv4 ranges names (additional): </strong>
                        {props.featuresData.gcp_existing_vpc.additional_ip_range_pods_names}
                      </li>
                    )}
                    {props.featuresData.gcp_existing_vpc.ip_range_services_name && (
                      <li>
                        <strong className="font-medium">IPv4 service range name: </strong>
                        {props.featuresData.gcp_existing_vpc.ip_range_services_name}
                      </li>
                    )}
                  </>
                )}
                {Object.keys(props.featuresData.features).map((id: string) => {
                  const currentFeature = props.featuresData && props.featuresData.features[id]

                  if (!currentFeature?.value) return null

                  return (
                    <li key={id}>
                      <strong className="font-medium">{currentFeature.title}: </strong>
                      {currentFeature.extendedValue ? currentFeature.extendedValue : currentFeature.value.toString()}
                    </li>
                  )
                })}
              </ul>
            </div>
            <Button type="button" variant="plain" size="md" onClick={props.goToFeatures}>
              <Icon className="text-base" iconName="gear-complex" />
            </Button>
          </Section>
        )}

        <div className="mt-10 flex justify-between">
          <Button onClick={props.onPrevious} type="button" size="lg" color="neutral" variant="surface">
            Back
          </Button>
          <div className="flex gap-2">
            {props.generalData.installation_type === 'MANAGED' ? (
              <>
                <Button
                  data-testid="button-create"
                  loading={props.isLoadingCreate}
                  onClick={() => props.onSubmit(false)}
                  size="lg"
                  color="neutral"
                  variant="surface"
                >
                  Create
                </Button>
                <Button
                  data-testid="button-create-deploy"
                  loading={props.isLoadingCreateAndDeploy}
                  onClick={() => props.onSubmit(true)}
                  size="lg"
                >
                  Create and install
                </Button>
              </>
            ) : (
              <Button
                data-testid="button-create"
                loading={props.isLoadingCreate}
                onClick={() => props.onSubmit(false)}
                size="lg"
                color="brand"
                variant="solid"
              >
                Create
              </Button>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}

export default StepSummary
