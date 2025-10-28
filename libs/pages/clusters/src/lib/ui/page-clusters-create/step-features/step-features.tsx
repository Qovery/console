import { type CloudProviderEnum, type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { type FormEventHandler, cloneElement } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { CardClusterFeature } from '@qovery/shared/console-shared'
import { type ClusterFeaturesData } from '@qovery/shared/interfaces'
import {
  Badge,
  BlockContent,
  Button,
  Callout,
  ExternalLink,
  Heading,
  Icon,
  InputSelect,
  InputText,
  LoaderSpinner,
  Section,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import AWSVpcFeature from './aws-vpc-feature/aws-vpc-feature'
import GCPVpcFeature from './gcp-vpc-feature/gcp-vpc-feature'
import SCWVpcFeature from './scw-vpc-feature/scw-vpc-feature'

const Qovery = '/assets/logos/logo-icon.svg'

export interface StepFeaturesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  features?: ClusterFeatureResponse[]
  goToBack?: () => void
  isKarpenter?: boolean
  isProduction?: boolean
}

export function StepFeatures(props: StepFeaturesProps) {
  const { onSubmit, features, cloudProvider, goToBack, isKarpenter, isProduction } = props
  const { formState, setValue, control, watch } = useFormContext()

  const watchVpcMode: ClusterFeaturesData['vpc_mode'] = watch('vpc_mode')

  // Ensure STATIC_IP feature is always displayed for SCW, even if not returned by API
  const enhancedFeatures = () => {
    if (cloudProvider !== 'SCW') {
      return features || []
    }
    const currentFeatures = features || []
    const hasStaticIp = currentFeatures.some(({ id }) => id === 'STATIC_IP')
    if (!hasStaticIp) {
      return [
        ...currentFeatures,
        {
          id: 'STATIC_IP',
          title: 'Static IP / Nat Gateways',
          description:
            'Your cluster will only be visible from a fixed number of public IP addresses. This reduces security risks and simplifies firewall rules.',
          is_cloud_provider_paying_feature: true,
          cloud_provider_feature_documentation: 'https://www.scaleway.com/en/public-gateway/',
          value_object: { type: 'BOOLEAN', value: false },
        } as ClusterFeatureResponse,
      ]
    }
    return currentFeatures
  }

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
    },
  ]

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Network configuration</Heading>
        <p className="mb-2 text-sm text-neutral-400">
          Configure the network mode by either using an existing VPC or letting Qovery manage the network setup for you.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        {cloudProvider !== 'SCW' && (
          <div className="mb-10">
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

            <Controller
              name="vpc_mode"
              control={control}
              rules={{ required: (cloudProvider as string) !== 'SCW' }}
              render={({ field }) => (
                <div className="mb-4 grid w-full grid-cols-2 gap-4">
                  {vpcModes.map((vpcMode) => (
                    <button
                      key={vpcMode.title}
                      className={twMerge(
                        'relative flex items-start gap-4 rounded border border-neutral-250 bg-white p-5 text-left shadow transition-all',
                        'outline-solid outline outline-2 -outline-offset-2 outline-transparent hover:outline-brand-500 focus:outline-2 focus:outline-brand-500',
                        field.value === vpcMode.value && 'border-brand-500 outline-brand-500'
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        setValue('vpc_mode', vpcMode.value)
                      }}
                    >
                      {cloneElement(vpcMode.icon, { className: 'w-[20px] h-[20px] mt-1' })}
                      <span className="flex flex-col gap-2">
                        <span className="flex items-start justify-between text-base font-semibold text-neutral-400">
                          {vpcMode.title}
                          {vpcMode.recommended && (
                            <span className="rounded bg-brand-500 px-1 py-1 text-[8px] font-semibold uppercase leading-none text-neutral-50">
                              recommended
                            </span>
                          )}
                        </span>
                        <span className="inline-block text-sm text-neutral-350">{vpcMode.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        )}

        {cloudProvider === 'AWS' && (
          <div>
            {match(watchVpcMode)
              .with('DEFAULT', () => (
                <div>
                  {enhancedFeatures().length > 0 ? (
                    enhancedFeatures().map((feature) => (
                      <CardClusterFeature
                        key={feature.id}
                        feature={feature}
                        cloudProvider={cloudProvider}
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        disabled={feature.id === 'STATIC_IP' && isKarpenter && isProduction}
                        tooltip={
                          feature.id === 'STATIC_IP' && isKarpenter && isProduction
                            ? 'This feature can not be disabled on a production cluster using Karpenter'
                            : undefined
                        }
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
                                IPv4 Addresses. Disabling it may cost you more, depending on the number of nodes in your
                                cluster. <br />
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
                      </CardClusterFeature>
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
                enhancedFeatures().length > 0 ? (
                  enhancedFeatures().map((feature) => (
                    <CardClusterFeature
                      key={feature.id}
                      feature={feature}
                      cloudProvider={cloudProvider}
                      control={control}
                      watch={watch}
                      setValue={setValue}
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
            <BlockContent title="Network features" classNameContent="p-0">
              {enhancedFeatures().length > 0 ? (
                enhancedFeatures()
                  .filter((feature) => feature.id === 'STATIC_IP')
                  .map((feature) => {
                    const isStaticIpEnabled = feature.id === 'STATIC_IP' && watch(`features.${feature.id}.value`)
                    return (
                      <CardClusterFeature
                        key={feature.id}
                        feature={feature}
                        cloudProvider={cloudProvider}
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        disabled
                        badge={
                          <Badge color="sky" variant="surface" size="sm">
                            Coming Soon
                          </Badge>
                        }
                      >
                        {isStaticIpEnabled && (
                          <div className="mt-4 space-y-4">
                            <Callout.Root color="yellow" className="mb-4">
                              <Callout.Icon>
                                <Icon iconName="triangle-exclamation" iconStyle="regular" />
                              </Callout.Icon>
                              <Callout.Text>
                                <Callout.TextHeading>Important</Callout.TextHeading>
                                <Callout.TextDescription>
                                  Static IP requires a VPC Gateway. Additional costs will apply based on your selected
                                  gateway type.
                                </Callout.TextDescription>
                              </Callout.Text>
                            </Callout.Root>
                            <Controller
                              name={`features.${feature.id}.gateway_type`}
                              control={control}
                              rules={{ required: false }}
                              render={({ field, fieldState: { error } }) => (
                                <InputSelect
                                  label="NAT Gateway Type"
                                  options={[
                                    { label: 'VPC GW S (20 Gbps bandwidth)', value: 'VPC_GW_S' },
                                    { label: 'VPC GW M (200 Gbps bandwidth)', value: 'VPC_GW_M' },
                                    { label: 'VPC GW L (1 Tbps bandwidth)', value: 'VPC_GW_L' },
                                  ]}
                                  onChange={field.onChange}
                                  value={field.value}
                                  error={error?.message}
                                  disabled
                                />
                              )}
                            />
                          </div>
                        )}
                      </CardClusterFeature>
                    )
                  })
              ) : (
                <div className="mt-2 flex justify-center">
                  <LoaderSpinner className="w-4" />
                </div>
              )}
            </BlockContent>
          </div>
        )}

        <div className="flex justify-between">
          <Button onClick={goToBack} type="button" variant="plain" size="lg">
            Back
          </Button>
          <Button data-testid="button-submit" type="submit" disabled={!formState.isValid} size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default StepFeatures
