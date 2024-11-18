import { type CloudProviderEnum, type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { CardClusterFeature } from '@qovery/shared/console-shared'
import { Button, Callout, ExternalLink, Heading, Icon, InputSelect, LoaderSpinner, Section } from '@qovery/shared/ui'
import AWSVpcFeature from './aws-vpc-feature/aws-vpc-feature'
import GCPVpcFeature from './gcp-vpc-feature/gcp-vpc-feature'

export interface StepFeaturesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  features?: ClusterFeatureResponse[]
  goToBack?: () => void
  isKarpenter?: boolean
}

export function StepFeatures(props: StepFeaturesProps) {
  const { onSubmit, features, cloudProvider, goToBack, isKarpenter } = props
  const { formState, setValue, control, watch } = useFormContext()

  const watchVpcMode = watch('vpc_mode')

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Features</Heading>
        <p className="mb-2 text-sm text-neutral-400">Additional features available on your cluster.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-10">
          <Callout.Root className="mb-4" color="yellow">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
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
          {cloudProvider === 'AWS' && (
            <div>
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
              ) : (
                <AWSVpcFeature isKarpenter={isKarpenter} />
              )}
            </div>
          )}
          {cloudProvider === 'GCP' && (
            <div>
              {watchVpcMode === 'DEFAULT' ? (
                features && features.length > 0 ? (
                  features.map((feature) => (
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
              ) : (
                <GCPVpcFeature />
              )}
            </div>
          )}
        </div>

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
