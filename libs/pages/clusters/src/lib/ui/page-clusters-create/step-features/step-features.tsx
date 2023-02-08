import { CloudProviderEnum, ClusterFeature } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { CardClusterFeature } from '@qovery/shared/console-shared'
import { BannerBox, BannerBoxEnum, Button, ButtonSize, ButtonStyle, LoaderSpinner } from '@qovery/shared/ui'

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
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Features</h3>
        <p className="text-text-500 text-sm mb-2">Additional features available on your cluster.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-10">
          {features && features.length > 0 ? (
            <div>
              <BannerBox
                className="mb-5"
                title="Choose wisely"
                message="These features will not be modifiable after cluster creation."
                type={BannerBoxEnum.WARNING}
              />
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
          <Button
            onClick={goToBack}
            type="button"
            className="btn--no-min-w"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Back
          </Button>
          <Button
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepFeatures
