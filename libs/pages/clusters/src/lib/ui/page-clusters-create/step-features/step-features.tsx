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
  const { formState, getValues, setValue, control, watch } = useFormContext()

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
            defaultValue="default"
            control={control}
            render={({ field }) => (
              <InputSelect
                className="mb-4"
                label="VPC mode"
                options={[
                  {
                    label: 'Default (managed by Qovery)',
                    value: 'default',
                  },
                  {
                    label: 'Deploy on my existing VPC',
                    value: 'existing-vpc',
                  },
                ]}
                onChange={field.onChange}
                value={field.value}
                portal={true}
              />
            )}
          />
          {watchVpcMode === 'default' ? (
            <div>
              {features && features.length > 0 ? (
                features.map((feature) => (
                  <CardClusterFeature
                    key={feature.id}
                    feature={feature}
                    cloudProvider={cloudProvider}
                    control={control}
                    getValues={getValues}
                    setValue={setValue}
                    callout={
                      feature.id === 'STATIC_IP' && (
                        <Callout.Root color="yellow" className="mt-4">
                          <Callout.Icon>
                            <Icon className="text-xs" iconName="triangle-exclamation" />
                          </Callout.Icon>
                          <Callout.Text className="text-xs">
                            <Callout.TextHeading>Warning</Callout.TextHeading>
                            <Callout.TextDescription>
                              This feature has been activated by default. Since February 1, 2024, AWS charge public IPv4
                              Addresses. Disabling it may cost you more, depending on the number of nodes in your
                              cluster.
                              <br />
                              <ExternalLink
                                size="xs"
                                href="https://aws.amazon.com/fr/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/"
                                className="mt-1"
                              >
                                Check this link for more information
                              </ExternalLink>
                            </Callout.TextDescription>
                          </Callout.Text>
                        </Callout.Root>
                      )
                    }
                  />
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
                name="vpc_id"
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
              <ButtonPopoverSubnets name="eks">EKS</ButtonPopoverSubnets>
              <hr className="my-3" />
              <h4 className="text-neutral-400 text-sm font-medium mb-3">
                Subnets IDs for managed databases (optional)
              </h4>
              <div className="flex gap-3">
                <ButtonPopoverSubnets name="mongodb">
                  <Icon name={IconEnum.MONGODB} width="16" className="mr-2" />
                  MongoDB
                </ButtonPopoverSubnets>
                <ButtonPopoverSubnets name="mysql">
                  <Icon name={IconEnum.MYSQL} width="16" className="mr-2" />
                  MySQL
                </ButtonPopoverSubnets>
                <ButtonPopoverSubnets name="mysql">
                  <Icon name={IconEnum.POSTGRESQL} width="16" className="mr-2" />
                  PostgreSQL
                </ButtonPopoverSubnets>
                <ButtonPopoverSubnets name="mysql">
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
