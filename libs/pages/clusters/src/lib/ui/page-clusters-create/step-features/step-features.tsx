import { CloudProviderEnum, ClusterFeature } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ClusterFeaturesData } from '@qovery/shared/interfaces'
import {
  BannerBox,
  BannerBoxEnum,
  Button,
  ButtonSize,
  ButtonStyle,
  IconAwesomeEnum,
  InputSelect,
  InputToggle,
  Link,
  LoaderSpinner,
} from '@qovery/shared/ui'

export interface StepFeaturesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  features?: ClusterFeature[]
  goToBack?: () => void
}

export function StepFeatures(props: StepFeaturesProps) {
  const { onSubmit, features, cloudProvider, goToBack } = props
  const { formState, control, getValues, setValue } = useFormContext<ClusterFeaturesData>()

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
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  data-testid="feature"
                  className="flex justify-between px-4 py-3 rounded border border-element-light-lighter-500 bg-element-light-lighter-200 mb-3 last:mb-0"
                  onClick={() => {
                    const active = getValues().features[index].id || undefined
                    setValue(`features.${index}.id`, !active ? feature.id : undefined)
                  }}
                >
                  <div className="flex w-full">
                    <Controller
                      name={`features.${index}.id`}
                      control={control}
                      render={({ field }) => (
                        <InputToggle
                          small
                          className="relative top-[2px]"
                          onChange={field.onChange}
                          value={field.value ? true : false}
                        />
                      )}
                    />
                    <div className="basis-full">
                      <h4 className="flex justify-between text-ssm text-text-600 mb-1 font-medium">
                        <span>{feature.title}</span>
                        <span className="text-ssm text-text-600 font-medium">
                          {feature.cost_per_month !== 0
                            ? `${feature.cost_per_month}/month billed by ${cloudProvider}`
                            : 'Free'}
                        </span>
                      </h4>
                      <p className="text-xs text-text-400 max-w-lg">{feature.description}</p>
                      {typeof feature.value === 'string' && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Controller
                            name={`features.${index}.value`}
                            control={control}
                            defaultValue={feature.value}
                            render={({ field }) => (
                              <InputSelect
                                className="mt-2"
                                options={
                                  (feature.accepted_values as string[])?.map((value) => ({
                                    label: value,
                                    value: value,
                                  })) || []
                                }
                                onChange={field.onChange}
                                value={field.value as string}
                                label="VPC Subnet address"
                                isSearchable
                                portal
                              />
                            )}
                          />
                        </div>
                      )}
                      <Link
                        external
                        className="font-medium"
                        size="text-xs"
                        link="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#features"
                        linkLabel="Documentation link"
                        iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
                        iconRightClassName="text-xxs relative top-[1px]"
                      />
                    </div>
                  </div>
                </div>
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
