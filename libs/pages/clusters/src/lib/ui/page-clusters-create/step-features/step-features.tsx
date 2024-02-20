import { type CloudProviderEnum, type ClusterFeature } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { CardClusterFeature } from '@qovery/shared/console-shared'
import {
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  Callout,
  Heading,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Section,
} from '@qovery/shared/ui'

export interface StepFeaturesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  features?: ClusterFeature[]
  goToBack?: () => void
}

export function StepFeatures(props: StepFeaturesProps) {
  const { onSubmit, features, cloudProvider, goToBack } = props
  const { formState, getValues, setValue, control } = useFormContext()

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Features</Heading>
        <p className="text-neutral-400 text-sm mb-2">Additional features available on your cluster.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-10">
          {features && features.length > 0 ? (
            <div>
              <Callout.Root className="mb-5" color="yellow">
                <Callout.Icon>
                  <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>Choose wisely</Callout.TextHeading>
                  <Callout.TextDescription>
                    These features will not be modifiable after cluster creation.
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
              {features.map((feature) => (
                <CardClusterFeature
                  key={feature.id}
                  feature={feature}
                  cloudProvider={cloudProvider}
                  control={control}
                  getValues={getValues}
                  setValue={setValue}
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center mt-2">
              <LoaderSpinner className="w-4" />
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
