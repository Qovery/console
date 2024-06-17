import { type ClusterInstanceTypeResponseListResultsInner } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
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
        <p className="mb-2 text-xs text-neutral-400">
          Here is what we will deploy, this action can take up to 30 minutes.
        </p>
      </div>

      <div className="mb-10">
        {props.generalData.installation_type === 'MANAGED' && (
          <Callout.Root color="yellow" className="mb-5">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Qovery manages this resource for you</Callout.TextHeading>
              <Callout.TextDescription className="text-xs">
                Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
                <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a
                drift in the configuration.
                <ExternalLink
                  className="ml-0.5"
                  size="xs"
                  href="https://hub.qovery.com/docs/useful-resources/faq/#how-do-you-support-new-kubernetes-version"
                >
                  See more details
                </ExternalLink>
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        )}
        <div
          data-testid="summary-general"
          className="mb-2 flex w-full rounded border border-neutral-250 bg-neutral-100 p-4"
        >
          <Icon iconName="check" className="mr-2 text-green-500" />
          <div className="mr-2 flex-grow">
            <div className="mb-2 text-sm font-bold text-neutral-400">General information</div>
            <ul className="list-none text-sm text-neutral-350">
              <li>
                Installation type:{' '}
                <strong className="font-medium">
                  {match(props.generalData.installation_type)
                    .with('MANAGED', () => 'Managed')
                    .with('SELF_MANAGED', () => 'Self-Managed')
                    .with('LOCAL_DEMO', () => undefined)
                    .exhaustive()}
                </strong>
              </li>
              <li>
                Cluster name: <strong className="font-medium">{props.generalData.name}</strong>
              </li>
              {props.generalData.production && (
                <li>
                  Production: <strong className="font-medium">true</strong>
                </li>
              )}
              <li>
                Provider:{' '}
                <strong className="inline-flex items-center font-medium">
                  <Icon className="ml-1 w-4" name={props.generalData.cloud_provider} />
                </strong>
              </li>
              <li>
                Region: <strong className="font-medium">{props.generalData.region}</strong>
              </li>
            </ul>
          </div>

          <Button type="button" variant="plain" size="md" onClick={props.goToGeneral}>
            <Icon className="text-base" iconName="gear-complex" />
          </Button>
        </div>

        {match(props.generalData)
          .with(
            { installation_type: 'MANAGED', cloud_provider: 'AWS' },
            { installation_type: 'MANAGED', cloud_provider: 'SCW' },
            () => (
              <div
                data-testid="summary-resources"
                className="mb-2 flex w-full rounded border border-neutral-250 bg-neutral-100 p-4"
              >
                <Icon iconName="check" className="mr-2 text-green-500" />
                <div className="mr-2 flex-grow">
                  <div className="mb-2 text-sm font-bold text-neutral-400">Resources</div>
                  <ul className="list-none text-sm text-neutral-350">
                    <li>
                      Cluster type: <strong className="font-medium">{props.resourcesData.cluster_type}</strong>
                    </li>
                    {!props.resourcesData.karpenter?.enabled ? (
                      <>
                        <li>
                          Instance type:{' '}
                          <strong className="font-medium">
                            {props.detailInstanceType?.name} ({props.detailInstanceType?.cpu}CPU -{' '}
                            {props.detailInstanceType?.ram_in_gb}GB RAM - {props.detailInstanceType?.architecture})
                          </strong>
                        </li>
                        <li>
                          Disk size: <strong className="font-medium">{props.resourcesData.disk_size} GB</strong>
                        </li>
                        <li>
                          Nodes:{' '}
                          <strong className="font-medium">
                            {props.resourcesData.nodes[0]} min - {props.resourcesData.nodes[1]} max
                          </strong>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          Karpenter: <strong className="font-medium">true</strong>
                        </li>
                        <li>
                          Storage:{' '}
                          <strong className="font-medium">{props.resourcesData.karpenter?.disk_size_in_gib} GB</strong>
                        </li>
                        <li>
                          Default node architecture:{' '}
                          <strong className="font-medium">
                            {props.resourcesData.karpenter?.default_service_architecture}
                          </strong>
                        </li>
                        <li>
                          Spot instances:{' '}
                          <strong className="font-medium">
                            {(props.resourcesData.karpenter?.spot_enabled ?? false).toString()}
                          </strong>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                <Button type="button" variant="plain" size="md" onClick={props.goToResources}>
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>
            )
          )
          .with({ installation_type: 'SELF_MANAGED' }, () => (
            <div
              data-testid="summary-kubeconfig"
              className="mb-2 flex w-full rounded border border-neutral-250 bg-neutral-100 p-4"
            >
              <Icon iconName="check" className="mr-2 text-green-500" />
              <div className="mr-2 flex-grow">
                <div className="mb-2 text-sm font-bold text-neutral-400">Kubeconfig</div>
                <ul className="list-none text-sm text-neutral-350">
                  <li>
                    Kubeconfig: <strong className="font-medium">{props.kubeconfigData?.file_name}</strong>
                  </li>
                </ul>
              </div>
              <Button type="button" variant="plain" size="md" onClick={props.goToKubeconfig}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
          ))
          .otherwise(() => null)}

        {props.remoteData && props.remoteData.ssh_key.length > 0 && (
          <div
            data-testid="summary-remote"
            className="mb-2 flex w-full rounded border border-neutral-250 bg-neutral-100 p-4"
          >
            <Icon iconName="check" className="mr-2 text-green-500" />
            <div className="mr-2 flex-grow">
              <div className="mb-2 text-sm font-bold text-neutral-400">Remote access</div>
              <ul className="list-none text-sm text-neutral-350">
                <li>
                  SSH key: <strong className="font-medium">{trimId(props.remoteData.ssh_key, 'both')}</strong>
                </li>
              </ul>
            </div>
            <Button type="button" variant="plain" size="md" onClick={props.goToRemote}>
              <Icon className="text-base" iconName="gear-complex" />
            </Button>
          </div>
        )}

        {props.featuresData && showFeaturesSection && (
          <div
            data-testid="summary-features"
            className="mb-2 flex w-full rounded border border-neutral-250 bg-neutral-100 p-4"
          >
            <Icon iconName="check" className="mr-2 text-green-500" />
            <div className="mr-2 flex-grow">
              <div className="mb-2 text-sm font-bold text-neutral-400">Features</div>
              <ul className="list-none text-sm text-neutral-350">
                {props.featuresData.aws_existing_vpc && (
                  <>
                    <li className="mb-2">
                      VPC ID:{' '}
                      <strong className="font-medium">{props.featuresData.aws_existing_vpc.aws_vpc_eks_id}</strong>
                    </li>
                    {props.featuresData.aws_existing_vpc.eks_subnets?.length !== 0 && (
                      <li className="mb-2">
                        EKS subnets ids:{' '}
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
                    {props.featuresData.aws_existing_vpc.mongodb_subnets?.length !== 0 && (
                      <li className="mb-2">
                        MongoDB subnets ids:
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
                      <li className="mb-2">
                        Redis subnets ids:
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
                      <li className="mb-2">
                        MySQL/PostgreSQL subnets ids:
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
                      VPC name: <strong className="font-medium">{props.featuresData.gcp_existing_vpc.vpc_name}</strong>
                    </li>
                    {props.featuresData.gcp_existing_vpc.vpc_project_id && (
                      <li>
                        VPC Project ID:{' '}
                        <strong className="font-medium">{props.featuresData.gcp_existing_vpc.vpc_project_id}</strong>
                      </li>
                    )}
                    {props.featuresData.gcp_existing_vpc.subnetwork_name && (
                      <li>
                        Subnetwork range name:{' '}
                        <strong className="font-medium">{props.featuresData.gcp_existing_vpc.subnetwork_name}</strong>
                      </li>
                    )}
                    {props.featuresData.gcp_existing_vpc.ip_range_pods_name && (
                      <li>
                        Pod IPv4 address range name:{' '}
                        <strong className="font-medium">
                          {props.featuresData.gcp_existing_vpc.ip_range_pods_name}
                        </strong>
                      </li>
                    )}
                    {props.featuresData.gcp_existing_vpc.additional_ip_range_pods_names && (
                      <li>
                        Cluster Pod IPv4 ranges names (additional):{' '}
                        <strong className="font-medium">
                          {props.featuresData.gcp_existing_vpc.additional_ip_range_pods_names}
                        </strong>
                      </li>
                    )}
                    {props.featuresData.gcp_existing_vpc.ip_range_services_name && (
                      <li>
                        IPv4 service range name:{' '}
                        <strong className="font-medium">
                          {props.featuresData.gcp_existing_vpc.ip_range_services_name}
                        </strong>
                      </li>
                    )}
                  </>
                )}
                {Object.keys(props.featuresData.features).map((id: string) => {
                  const currentFeature = props.featuresData && props.featuresData.features[id]

                  if (!currentFeature?.value) return null

                  return (
                    <li key={id}>
                      {currentFeature.title}:{' '}
                      <strong className="font-medium">
                        {currentFeature.extendedValue ? currentFeature.extendedValue : currentFeature.value.toString()}
                      </strong>
                    </li>
                  )
                })}
              </ul>
            </div>
            <Button type="button" variant="plain" size="md" onClick={props.goToFeatures}>
              <Icon className="text-base" iconName="gear-complex" />
            </Button>
          </div>
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
