import { type CloudProviderEnum, type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { type FormEventHandler, cloneElement, useEffect } from 'react'
import {
  type Control,
  type FieldValues,
  FormProvider,
  type UseFormSetValue,
  type UseFormWatch,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { match } from 'ts-pattern'
import { useCloudProviderFeatures } from '@qovery/domains/cloud-providers/feature'
import { type ClusterFeaturesData, type Subnets } from '@qovery/shared/interfaces'
import {
  Button,
  Callout,
  ExternalLink,
  FunnelFlowBody,
  Heading,
  Icon,
  Link,
  LoaderSpinner,
  Section,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { ClusterCardFeature } from '../../cluster-card-feature/cluster-card-feature'
import { ScalewayStaticIp } from '../../scaleway-static-ip/scaleway-static-ip'
import { steps, useClusterContainerCreateContext } from '../cluster-creation-flow'
import AWSVpcFeature from './aws-vpc-feature/aws-vpc-feature'
import GCPVpcFeature from './gcp-vpc-feature/gcp-vpc-feature'

const Qovery = '/assets/logos/logo-icon.svg'
const removeEmptySubnet = (objects?: Subnets[]) =>
  objects?.filter((field) => field.A !== '' || field.B !== '' || field.C !== '')

export interface StepFeaturesProps {
  organizationId: string
  onSubmit: () => void
}

interface ClusterCardFeatureFormBindings {
  control: Control<FieldValues>
  watch: UseFormWatch<FieldValues>
  setValue: UseFormSetValue<FieldValues>
}

interface StepFeaturesFormProps {
  organizationId: string
  cloudProvider?: CloudProviderEnum
  features?: ClusterFeatureResponse[]
  onSubmit: FormEventHandler<HTMLFormElement>
  isKarpenter?: boolean
  isProduction?: boolean
}

function StepFeaturesForm({
  organizationId,
  cloudProvider,
  features,
  onSubmit,
  isKarpenter,
  isProduction,
}: StepFeaturesFormProps) {
  const { formState, setValue, control, watch } = useFormContext<ClusterFeaturesData>()
  const clusterCardFeatureFormBindings: ClusterCardFeatureFormBindings = {
    control: control as unknown as Control<FieldValues>,
    watch: watch as unknown as UseFormWatch<FieldValues>,
    setValue: setValue as unknown as UseFormSetValue<FieldValues>,
  }
  const watchVpcMode = watch('vpc_mode')

  const backTo = match(cloudProvider)
    .with('GCP', () => '/organization/$organizationId/cluster/create/$slug/general' as const)
    .otherwise(() => '/organization/$organizationId/cluster/create/$slug/resources' as const)

  const vpcModes = [
    {
      title: 'Qovery managed',
      value: 'DEFAULT',
      description: 'Let Qovery create and manage the VPC and networking resources for you. Best for most use cases.',
      icon: <img className="mt-1 select-none" width={20} height={20} src={Qovery} alt="Qovery managed" />,
      recommended: true,
    },
    {
      title: 'Self-managed',
      value: 'EXISTING_VPC',
      description: 'Use your own existing VPC and networking configuration if you need full control.',
      icon: <Icon name={cloudProvider?.toUpperCase()} />,
      recommended: false,
    },
  ] as const

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Network configuration</Heading>
        {cloudProvider === 'SCW' ? (
          <p className="mb-2 text-sm text-neutral">Configure network features for your Scaleway cluster.</p>
        ) : (
          <p className="mb-2 text-sm text-neutral-subtle">
            Configure the network mode by either using an existing VPC or letting Qovery manage the network setup for
            you.
          </p>
        )}
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-10">
          {cloudProvider !== 'SCW' && (
            <>
              <Callout.Root className="mb-4" color="yellow">
                <Callout.Icon>
                  <Icon iconName="triangle-exclamation" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>Choose wisely</Callout.TextHeading>
                  <Callout.TextDescription>
                    This configuration cannot be changed after the cluster is created.
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>

              <div className="mb-4 grid w-full grid-cols-2 gap-4">
                {vpcModes.map((vpcMode) => (
                  <button
                    key={vpcMode.title}
                    className={twMerge(
                      'relative flex items-start gap-4 rounded border border-neutral bg-surface-neutral-component p-5 text-left shadow transition-all',
                      'hover:border-surface-brand-solidHover',
                      watchVpcMode === vpcMode.value && 'border-surface-brand-solid'
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      setValue('vpc_mode', vpcMode.value)
                    }}
                  >
                    {cloneElement(vpcMode.icon, { className: 'w-[20px] h-[20px] mt-1' })}
                    <span className="flex flex-col gap-2">
                      <span className="flex items-start justify-between text-base font-semibold text-neutral">
                        {vpcMode.title}
                        {vpcMode.recommended && (
                          <span className="rounded bg-surface-brand-solid px-1 py-1 text-[8px] font-semibold uppercase leading-none text-neutralInvert">
                            recommended
                          </span>
                        )}
                      </span>
                      <span className="inline-block text-sm text-neutral-subtle">{vpcMode.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {cloudProvider === 'AWS' && (
            <div>
              {match(watchVpcMode)
                .with('DEFAULT', () => (
                  <div>
                    {features && features.length > 0 ? (
                      features.map((feature) => (
                        <ClusterCardFeature
                          key={feature.id}
                          feature={feature}
                          cloudProvider={cloudProvider}
                          control={clusterCardFeatureFormBindings.control}
                          watch={clusterCardFeatureFormBindings.watch}
                          setValue={clusterCardFeatureFormBindings.setValue}
                        >
                          {feature.id === 'STATIC_IP' && (
                            <Callout.Root color="yellow" className="mt-4">
                              <Callout.Icon>
                                <Icon iconName="triangle-exclamation" iconStyle="regular" />
                              </Callout.Icon>
                              <Callout.Text>
                                <Callout.TextHeading>Warning</Callout.TextHeading>
                                <Callout.TextDescription>
                                  This feature has been activated by default. Since February 1, 2024, AWS charge public
                                  IPv4 Addresses. Disabling it may cost you more, depending on the number of nodes in
                                  your cluster. <br />
                                  <ExternalLink
                                    href="https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/"
                                    className="mt-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Check this link for more information
                                  </ExternalLink>
                                </Callout.TextDescription>
                              </Callout.Text>
                            </Callout.Root>
                          )}
                        </ClusterCardFeature>
                      ))
                    ) : (
                      <div className="mt-2 flex justify-center">
                        <LoaderSpinner className="w-4" />
                      </div>
                    )}
                  </div>
                ))
                .with('EXISTING_VPC', () => <AWSVpcFeature isKarpenter={isKarpenter} />)
                .otherwise(() => null)}
            </div>
          )}
          {cloudProvider === 'GCP' && (
            <div>
              {match(watchVpcMode)
                .with('DEFAULT', () =>
                  features && features.length > 0 ? (
                    features.map((feature) => (
                      <ClusterCardFeature
                        key={feature.id}
                        feature={feature}
                        cloudProvider={cloudProvider}
                        control={clusterCardFeatureFormBindings.control}
                        watch={clusterCardFeatureFormBindings.watch}
                        setValue={clusterCardFeatureFormBindings.setValue}
                      />
                    ))
                  ) : (
                    <div className="mt-2 flex justify-center">
                      <LoaderSpinner className="w-4" />
                    </div>
                  )
                )
                .with('EXISTING_VPC', () => <GCPVpcFeature />)
                .otherwise(() => null)}
            </div>
          )}
          {cloudProvider === 'SCW' && (
            <div>
              {features && features.length > 0 ? (
                <ScalewayStaticIp
                  staticIpFeature={features.find(({ id }) => id === 'STATIC_IP')}
                  natGatewayFeature={features.find(({ id }) => id === 'NAT_GATEWAY')}
                  production={isProduction || false}
                />
              ) : (
                <div className="mt-2 flex justify-center">
                  <LoaderSpinner className="w-4" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Link
            as="button"
            size="lg"
            type="button"
            variant="plain"
            color="neutral"
            to={backTo}
            params={{ organizationId }}
          >
            Back
          </Link>
          <Button data-testid="button-submit" type="submit" disabled={!formState.isValid} size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export function StepFeatures({ organizationId, onSubmit }: StepFeaturesProps) {
  const { setFeaturesData, generalData, featuresData, resourcesData, setCurrentStep } =
    useClusterContainerCreateContext()
  const { data: features } = useCloudProviderFeatures({
    cloudProvider: generalData?.cloud_provider ?? 'AWS',
  })

  useEffect(() => {
    const stepIndex = steps(generalData).findIndex((step) => step.key === 'features') + 1
    setCurrentStep(stepIndex)
  }, [setCurrentStep, generalData])

  const methods = useForm<ClusterFeaturesData>({
    defaultValues: featuresData,
    mode: 'onChange',
  })

  const handleSubmit = methods.handleSubmit((data) => {
    if (generalData?.cloud_provider === 'AWS' || generalData?.cloud_provider === 'GCP') {
      if (data.vpc_mode === 'DEFAULT') {
        const cloneData: ClusterFeaturesData['features'] = {}

        for (const id of Object.keys(data.features ?? {})) {
          const featureData = features?.find((f) => f.id === id)
          const currentFeature = data.features[id]

          cloneData[id] = {
            id,
            title: featureData?.title ?? '',
            value: currentFeature?.value || false,
            extendedValue: currentFeature?.extendedValue,
          }
        }

        setFeaturesData({
          vpc_mode: 'DEFAULT',
          features: cloneData,
        })
      } else {
        if (generalData.cloud_provider === 'AWS') {
          const existingVpcData = data.aws_existing_vpc
          setFeaturesData({
            vpc_mode: 'EXISTING_VPC',
            aws_existing_vpc: {
              aws_vpc_eks_id: existingVpcData?.aws_vpc_eks_id ?? '',
              eks_create_nodes_in_private_subnet: existingVpcData?.eks_create_nodes_in_private_subnet ?? false,
              eks_subnets: removeEmptySubnet(existingVpcData?.eks_subnets),
              eks_karpenter_fargate_subnets: removeEmptySubnet(existingVpcData?.eks_karpenter_fargate_subnets),
              mongodb_subnets: removeEmptySubnet(existingVpcData?.mongodb_subnets),
              rds_subnets: removeEmptySubnet(existingVpcData?.rds_subnets),
              redis_subnets: removeEmptySubnet(existingVpcData?.redis_subnets),
            },
            features: {},
          })
        }
        if (generalData.cloud_provider === 'GCP') {
          const existingVpcData = data.gcp_existing_vpc
          setFeaturesData({
            vpc_mode: data.vpc_mode,
            gcp_existing_vpc: existingVpcData?.vpc_name
              ? {
                  vpc_name: existingVpcData?.vpc_name ?? '',
                  vpc_project_id: existingVpcData?.vpc_project_id,
                  subnetwork_name: existingVpcData?.subnetwork_name,
                  ip_range_services_name: existingVpcData?.ip_range_services_name,
                  ip_range_pods_name: existingVpcData?.ip_range_pods_name,
                  additional_ip_range_pods_names: existingVpcData?.additional_ip_range_pods_names,
                }
              : undefined,
            features: {},
          })
        }
      }
    }

    if (generalData?.cloud_provider === 'SCW') {
      const cloneData: ClusterFeaturesData['features'] = { ...featuresData?.features }

      if (data.features) {
        for (const id of Object.keys(data.features)) {
          const featureData = features?.find((f) => f.id === id)
          const currentFeature = data.features[id]

          cloneData[id] = {
            id,
            title: featureData?.title ?? '',
            value: currentFeature?.value || false,
            extendedValue: currentFeature?.extendedValue,
          }
        }
      }

      setFeaturesData({
        vpc_mode: 'DEFAULT',
        features: cloneData,
      })
    }

    onSubmit()
  })

  useEffect(() => {
    if (features && Object.keys(featuresData?.features ?? {}).length === 0) {
      const staticIp = features.find(({ id }) => id === 'STATIC_IP')
      if (staticIp && staticIp.value_object?.value === false) {
        methods.setValue('features.STATIC_IP.value', true)
      }
    }
  }, [features, featuresData, methods])

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepFeaturesForm
          organizationId={organizationId}
          cloudProvider={generalData?.cloud_provider}
          features={features}
          onSubmit={handleSubmit}
          isKarpenter={resourcesData?.karpenter?.enabled}
          isProduction={generalData?.production}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepFeatures
