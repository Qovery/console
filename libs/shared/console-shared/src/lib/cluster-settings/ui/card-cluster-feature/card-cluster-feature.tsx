import { type CloudProviderEnum, type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { type PropsWithChildren, useEffect, useState } from 'react'
import { type Control, Controller, type FieldValues, type UseFormSetValue, type UseFormWatch } from 'react-hook-form'
import { ExternalLink, Icon, InputSelect, InputToggle, Tooltip } from '@qovery/shared/ui'

export interface CardClusterFeatureProps extends PropsWithChildren {
  feature: ClusterFeatureResponse
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
      } mb-4 border-neutral-250 last:mb-0`}
      onClick={() => {
        if (feature.id && !disabled && setValue) {
          setValue(`features.${feature.id}.value`, !name)
          setCurrentDisabled(!name)
        }
      }}
    >
      <div className="flex w-full gap-3">
        {control ? (
          <Controller
            name={`features.${feature.id}.value`}
            control={control}
            render={({ field }) => (
              <InputToggle disabled={disabled} small className="relative top-[2px]" value={field.value} />
            )}
          />
        ) : (
          <InputToggle
            disabled
            small
            className="relative top-[2px]"
            value={getValue(Boolean(feature?.value_object?.value) || false)}
          />
        )}
        <div className="basis-full">
          <h4 className="mb-1 flex justify-between text-ssm font-medium text-neutral-400">
            <span>{feature.title}</span>
            {feature.is_cloud_provider_paying_feature && (
              <Tooltip content={`Billed by ${cloudProvider}`}>
                <ExternalLink
                  as="button"
                  href={feature.cloud_provider_feature_documentation ?? undefined}
                  className="gap-1 px-1.5"
                  color="neutral"
                  variant="solid"
                  size="xs"
                  radius="full"
                >
                  <Icon iconName="dollar-sign" iconStyle="solid" className="text-xs text-white" />
                  <Icon name={cloudProvider} height="16" width="16" pathColor="#FFFFFF" />
                </ExternalLink>
              </Tooltip>
            )}
          </h4>
          <p className="max-w-lg text-xs text-neutral-350">{feature.description}</p>
          {typeof feature.value_object?.value === 'string' && (
            <div onClick={(e) => e.stopPropagation()}>
              {control ? (
                <Controller
                  name={`features.${feature.id}.extendedValue`}
                  control={control}
                  defaultValue={feature.value_object?.value}
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
                  value={feature.value_object.value}
                  label="VPC Subnet address"
                  disabled
                />
              )}
            </div>
          )}
          <ExternalLink
            onClick={(e) => e.stopPropagation()}
            size="xs"
            href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#features"
          >
            Documentation link
          </ExternalLink>
        </div>
      </div>
      {children}
    </div>
  )
}

export default CardClusterFeature
