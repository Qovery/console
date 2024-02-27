import { type CloudProviderEnum, type ClusterFeature } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { CardClusterFeature } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import {
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  Callout,
  ExternalLink,
  Heading,
  Icon,
  InputSelect,
  InputText,
  LoaderSpinner,
  Section,
} from '@qovery/shared/ui'
import ButtonPopoverSubnets from './button-popover-subnets/button-popover-subnets'

export interface StepFeaturesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  features?: ClusterFeature[]
  goToBack?: () => void
}

export function StepFeatures(props: StepFeaturesProps) {
  const { onSubmit, features, cloudProvider, goToBack } = props
  const { formState, setValue, control, watch } = useFormContext()

  const watchVpcMode = watch('vpc_mode')

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Features</Heading>
        <p className="text-neutral-400 text-sm mb-2">Additional features available on your cluster.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-10">
          <Callout.Root className="mb-4" color="yellow">
            <Callout.Icon>
              <Icon className="text-xs" iconName="triangle-exclamation" />
            </Callout.Icon>
            <Callout.Text className="text-xs">
              <Callout.TextHeading>Choose wisely</Callout.TextHeading>
              <Callout.TextDescription>
                These features will not be modifiable after cluster creation.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
          <Controller
            name="vpc_mode"
            defaultValue="DEFAULT"
            control={control}
            render={({ field }) => (
              <InputSelect
                className="mb-4"
                label="VPC mode"
                options={[
                  {
                    label: 'Default (managed by Qovery)',
                    value: 'DEFAULT',
                  },
                  {
                    label: 'Deploy on my existing VPC',
                    value: 'EXISTING_VPC',
                  },
                ]}
                onChange={field.onChange}
                value={field.value}
                portal={true}
              />
            )}
          />
          {watchVpcMode === 'DEFAULT' ? (
            <div>
              {features && features.length > 0 ? (
                features.map((feature) => (
                  <CardClusterFeature
                    key={feature.id}
                    feature={feature}
                    cloudProvider={cloudProvider}
                    control={control}
                    watch={watch}
                    setValue={setValue}
                  >
                    {feature.id === 'STATIC_IP' && (
                      <Callout.Root color="yellow" className="mt-4">
                        <Callout.Icon>
                          <Icon className="text-xs" iconName="triangle-exclamation" />
                        </Callout.Icon>
                        <Callout.Text className="text-xs">
                          <Callout.TextHeading>Warning</Callout.TextHeading>
                          <Callout.TextDescription>
                            This feature has been activated by default. Since February 1, 2024, aws_existing_vpccharge
                            public IPv4 Addresses. Disabling it may cost you more, depending on the number of nodes in
                            your cluster.
                            <br />
                            <ExternalLink
                              size="xs"
                              href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#use-existing-vpc"
                              className="mt-1"
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
                <div className="flex justify-center mt-2">
                  <LoaderSpinner className="w-4" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col justify-between p-4 rounded border bg-neutral-100 border-neutral-250">
              <h4 className="text-neutral-400 text-sm font-medium mb-1">Deploy on an existing VPC</h4>
              <p className="text-neutral-350 text-sm mb-4">In your VPC settings, you must enable the DNS hostnames.</p>
              <Controller
                name="aws_existing_vpc.aws_vpc_eks_id"
                rules={{ required: true }}
                control={control}
                render={({ field }) => (
                  <>
                    <InputText label="VPC ID" name={field.name} value={field.value} onChange={field.onChange} />
                    <ExternalLink
                      size="xs"
                      href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/"
                      className="mt-1 ml-4 mb-4"
                    >
                      How to configure your VPC
                    </ExternalLink>
                  </>
                )}
              />
              <h4 className="text-neutral-400 text-sm font-medium mb-3">EKS subnet IDs</h4>
              <ButtonPopoverSubnets
                title="EKS subnets IDs"
                name="aws_existing_vpc.eks_subnets"
                callout={
                  <Callout.Root className="mb-4" color="sky">
                    <Callout.Icon>
                      <Icon className="text-xs" iconName="triangle-exclamation" />
                    </Callout.Icon>
                    <Callout.Text className="text-xs">
                      <Callout.TextHeading>
                        You must enable auto-assign public IPv4 address in the subnets settings for EKS
                      </Callout.TextHeading>
                    </Callout.Text>
                  </Callout.Root>
                }
              >
                <Icon name={IconEnum.EKS} width="16" className="mr-2" />
                EKS
              </ButtonPopoverSubnets>
              <hr className="my-3" />
              <h4 className="text-neutral-400 text-sm font-medium mb-3">
                Subnets IDs for managed databases (optional)
              </h4>
              <div className="flex gap-3">
                <ButtonPopoverSubnets title="MongoDB subnets IDs" name="aws_existing_vpc.mongodb_subnets">
                  <Icon name={IconEnum.MONGODB} width="16" className="mr-2" />
                  MongoDB
                </ButtonPopoverSubnets>
                <ButtonPopoverSubnets title="MySQL subnets IDs" name="aws_existing_vpc.rds_subnets">
                  <Icon name={IconEnum.MYSQL} width="16" className="mr-2" />
                  MySQL
                  <span className="px-2">|</span>
                  <Icon name={IconEnum.POSTGRESQL} width="16" className="mr-2" />
                  PostgreSQL
                </ButtonPopoverSubnets>
                <ButtonPopoverSubnets title="Redis subnets IDs" name="aws_existing_vpc.redis_subnets">
                  <Icon name={IconEnum.REDIS} width="16" className="mr-2" />
                  Redis
                </ButtonPopoverSubnets>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <ButtonLegacy
            onClick={goToBack}
            type="button"
            className="btn--no-min-w"
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.STROKED}
          >
            Back
          </ButtonLegacy>
          <ButtonLegacy
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.BASIC}
          >
            Continue
          </ButtonLegacy>
        </div>
      </form>
    </Section>
  )
}

export default StepFeatures
