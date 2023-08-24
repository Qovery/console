import { type CloudProviderEnum, type ClusterFeature } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import {
  type Control,
  Controller,
  type FieldValues,
  type UseFormGetValues,
  type UseFormSetValue,
} from 'react-hook-form'
import { IconAwesomeEnum, InputSelect, InputToggle, Link } from '@qovery/shared/ui'

export interface CardClusterFeatureProps {
  feature: ClusterFeature
  cloudProvider?: CloudProviderEnum
  disabled?: boolean
  getValues?: UseFormGetValues<FieldValues>
  setValue?: UseFormSetValue<FieldValues>
  control?: Control<FieldValues>
}

export function CardClusterFeature(props: CardClusterFeatureProps) {
  const { feature, cloudProvider, disabled = false, getValues, setValue, control } = props

  const [currentDisabled, setCurrentDisabled] = useState<boolean>(disabled)

  const getValue = (value: boolean | string) => {
    if (typeof value === 'string') {
      return true
    }
    return value
  }

  useEffect(() => {
    if (feature.id && getValues) {
      if (getValues()[feature.id]?.value) setCurrentDisabled(true)
    }
  }, [feature.id, getValues])

  return (
    <div
      data-testid="feature"
      className={`flex justify-between px-4 py-3 ${
        control ? 'rounded border bg-neutral-100' : 'border-b last:border-0'
      } border-neutral-250 mb-3 last:mb-0`}
      onClick={() => {
        if (feature.id && !disabled && getValues && setValue && control) {
          const active = getValues()[feature.id].value
          setValue(`${feature.id}.value`, !active)
          setCurrentDisabled(!active)
        }
      }}
    >
      <div className="flex w-full">
        {control ? (
          <Controller
            name={`${feature.id}.value`}
            control={control}
            render={({ field }) => (
              <InputToggle disabled={disabled} small className="relative top-[2px]" value={field.value} />
            )}
          />
        ) : (
          <InputToggle disabled small className="relative top-[2px]" value={getValue(feature?.value || false)} />
        )}
        <div className="basis-full">
          <h4 className="flex justify-between text-ssm text-neutral-400 mb-1 font-medium">
            <span>{feature.title}</span>
            <span className="text-ssm text-neutral-400 font-medium">
              {feature.cost_per_month !== 0 ? `$${feature.cost_per_month}/month billed by ${cloudProvider}` : 'Free'}
            </span>
          </h4>
          <p className="text-xs text-neutral-350 max-w-lg">{feature.description}</p>
          {typeof feature.value === 'string' && (
            <div onClick={(e) => e.stopPropagation()}>
              {control ? (
                <Controller
                  name={`${feature.id}.extendedValue`}
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
                      value={field.value}
                      label="VPC Subnet address"
                      isSearchable
                      disabled={!currentDisabled}
                      portal
                    />
                  )}
                />
              ) : (
                <InputSelect
                  className="mt-2"
                  options={
                    (feature.accepted_values as string[])?.map((value) => ({
                      label: value,
                      value: value,
                    })) || []
                  }
                  value={feature.value}
                  label="VPC Subnet address"
                  disabled
                />
              )}
            </div>
          )}
          <Link
            external
            className="font-medium"
            size="text-xs"
            link="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#features"
            linkLabel="Documentation link"
            iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
            iconRightClassName="text-2xs relative top-[1px]"
          />
        </div>
      </div>
    </div>
  )
}

export default CardClusterFeature
