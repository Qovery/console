import { type CloudProviderEnum, type ClusterFeature } from 'qovery-typescript-axios'
import { type PropsWithChildren, useEffect, useState } from 'react'
import { type Control, Controller, type FieldValues, type UseFormSetValue, type UseFormWatch } from 'react-hook-form'
import { ExternalLink, InputSelect, InputToggle } from '@qovery/shared/ui'

export interface CardClusterFeatureProps extends PropsWithChildren {
  feature: ClusterFeature
  cloudProvider?: CloudProviderEnum
  disabled?: boolean
  setValue?: UseFormSetValue<FieldValues>
  watch?: UseFormWatch<FieldValues>
  control?: Control<FieldValues>
}

export function CardClusterFeature({
  feature,
  cloudProvider,
  disabled = false,
  watch,
  setValue,
  control,
  children,
}: CardClusterFeatureProps) {
  const [currentDisabled, setCurrentDisabled] = useState<boolean>(disabled)

  const name = watch && watch(`features.${feature.id}.value`)

  const getValue = (value: boolean | string) => {
    if (typeof value === 'string') {
      return true
    }
    return value
  }

  useEffect(() => {
    if (feature.id) {
      if (name) setCurrentDisabled(true)
    }
  }, [feature.id, name])

  return (
    <div
      data-testid="feature"
      className={`flex flex-col justify-between px-4 py-3 ${
        control ? 'rounded border bg-neutral-100' : 'border-b last:border-0'
      } border-neutral-250 mb-4 last:mb-0`}
      onClick={() => {
        if (feature.id && !disabled && setValue) {
          // Specific case for STATIC_IP because the back-end can't return `true` by default
          if (feature.id === 'STATIC_IP' && feature.value === 'undefined') {
            setValue(`features.${feature.id}.value`, false)
          }

          setValue(`features.${feature.id}.value`, !name)
          setCurrentDisabled(!name)
        }
      }}
    >
      <div className="flex w-full">
        {control ? (
          <Controller
            name={`features.${feature.id}.value`}
            control={control}
            // Update value for STATIC_IP feature because the back-end can't return `true` by default
            defaultValue={feature.id === 'STATIC_IP' ? true : false}
            render={({ field }) => (
              <InputToggle disabled={disabled} small className="relative top-[2px]" value={field.value} />
            )}
          />
        ) : (
          <InputToggle
            disabled
            small
            className="relative top-[2px]"
            value={getValue(Boolean(feature?.value) || false)}
          />
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
                  name={`features.${feature.id}.extendedValue`}
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
          <ExternalLink size="xs" href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#features">
            Documentation link
          </ExternalLink>
        </div>
      </div>
      {children}
    </div>
  )
}

export default CardClusterFeature
