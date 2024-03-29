import { type CloudProviderEnum, type ClusterFeature } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { CardClusterFeature } from '@qovery/shared/console-shared'
import {
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  Callout,
  ExternalLink,
  Heading,
  Icon,
  InputSelect,
  LoaderSpinner,
  Section,
} from '@qovery/shared/ui'
import AWSVpcFeature from './aws-vpc-feature/aws-vpc-feature'
import GCPVpcFeature from './gcp-vpc-feature/gcp-vpc-feature'

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
                              <Icon className="text-xs" iconName="triangle-exclamation" />
                            </Callout.Icon>
                            <Callout.Text className="text-xs">
                              <Callout.TextHeading>Warning</Callout.TextHeading>
                              <Callout.TextDescription>
                                This feature has been activated by default. Since February 1, 2024, AWS charge public
                                IPv4 Addresses. Disabling it may cost you more, depending on the number of nodes in your
                                cluster. <br />
                                <ExternalLink
                                  size="xs"
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
                    <div className="flex justify-center mt-2">
                      <LoaderSpinner className="w-4" />
                    </div>
                  )}
                </div>
              ) : (
                <AWSVpcFeature />
              )}
            </div>
          )}
          {cloudProvider === 'GCP' && watchVpcMode !== 'DEFAULT' && <GCPVpcFeature />}
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
