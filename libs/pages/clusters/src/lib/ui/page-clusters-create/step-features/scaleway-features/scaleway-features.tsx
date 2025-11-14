import { type ClusterFeatureResponse } from 'qovery-typescript-axios'
import {
  type Control,
  Controller,
  type FieldValues,
  type UseFormSetValue,
  type UseFormWatch,
  useFormContext,
} from 'react-hook-form'
import { ExternalLink, Icon, InputSelect, InputToggle, Tooltip } from '@qovery/shared/ui'

// Hardcoded Scaleway NAT Gateway types
const SCALEWAY_NAT_GATEWAY_TYPES = [
  { label: 'VPC-GW-S', value: 'VPC-GW-S' },
  { label: 'VPC-GW-M', value: 'VPC-GW-M' },
  { label: 'VPC-GW-L', value: 'VPC-GW-L' },
  { label: 'VPC-GW-XL', value: 'VPC-GW-XL' },
]

export interface ScalewayFeaturesProps {
  staticIpFeature?: ClusterFeatureResponse
  natGatewayFeature?: ClusterFeatureResponse
  control?: Control<FieldValues>
  watch?: UseFormWatch<FieldValues>
  setValue?: UseFormSetValue<FieldValues>
}

export function ScalewayFeatures({
  staticIpFeature,
  natGatewayFeature,
  control: controlProp,
  watch: watchProp,
  setValue: setValueProp,
}: ScalewayFeaturesProps) {
  // Use props if provided, otherwise get from form context
  const formContext = useFormContext<FieldValues>()
  const control = controlProp || formContext.control
  const watch = watchProp || formContext.watch
  const setValue = setValueProp || formContext.setValue

  const staticIpEnabled = staticIpFeature?.id ? watch(`features.${staticIpFeature.id}.value`) : false
  const natGatewayType = natGatewayFeature?.id ? watch(`features.${natGatewayFeature.id}.extendedValue`) : undefined

  return (
    <div className="rounded border border-neutral-250 bg-neutral-100 px-4 py-3">
      <div className="flex flex-col gap-4">
        {/* Static IP Toggle */}
        {staticIpFeature && (
          <div className="flex items-start gap-3">
            <Controller
              name={`features.${staticIpFeature.id}.value`}
              control={control}
              defaultValue={Boolean(staticIpFeature.value_object?.value)}
              render={({ field }) => (
                <InputToggle
                  small
                  className="relative top-[2px]"
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    // When enabling Static IP, set default NAT Gateway type if not already set
                    if (value && natGatewayFeature?.id && !natGatewayType) {
                      const defaultType = SCALEWAY_NAT_GATEWAY_TYPES[0].value
                      setValue(`features.${natGatewayFeature.id}.extendedValue`, defaultType)
                      setValue(`features.${natGatewayFeature.id}.value`, true)
                    }
                  }}
                />
              )}
            />
            <div className="flex-1">
              <h4 className="mb-1 flex justify-between text-sm font-medium text-neutral-400">
                <span>{staticIpFeature.title}</span>
                {staticIpFeature.is_cloud_provider_paying_feature && (
                  <Tooltip content="Billed by Scaleway">
                    <ExternalLink
                      as="button"
                      href={staticIpFeature.cloud_provider_feature_documentation ?? undefined}
                      className="gap-1 px-1.5"
                      color="neutral"
                      variant="solid"
                      size="xs"
                      radius="full"
                    >
                      <Icon iconName="dollar-sign" iconStyle="solid" className="text-xs text-white" />
                      <Icon name="SCW" height="16" width="16" pathColor="#FFFFFF" />
                    </ExternalLink>
                  </Tooltip>
                )}
              </h4>
              <p className="text-xs text-neutral-350">{staticIpFeature.description}</p>
            </div>
          </div>
        )}

        {/* NAT Gateway Type Select */}
        {natGatewayFeature && (
          <div className="ml-8">
            <Controller
              name={`features.${natGatewayFeature.id}.extendedValue`}
              control={control}
              defaultValue={SCALEWAY_NAT_GATEWAY_TYPES[0].value}
              render={({ field }) => (
                <InputSelect
                  label="NAT Gateway Type"
                  options={SCALEWAY_NAT_GATEWAY_TYPES}
                  onChange={(value) => {
                    field.onChange(value)
                    // Auto-enable static IP when NAT Gateway type is selected
                    if (staticIpFeature?.id && value) {
                      setValue(`features.${staticIpFeature.id}.value`, true)
                    }
                    // Mark NAT_GATEWAY as enabled when type is selected
                    if (natGatewayFeature.id && value) {
                      setValue(`features.${natGatewayFeature.id}.value`, true)
                    }
                  }}
                  value={field.value}
                  disabled={!staticIpEnabled}
                  portal
                />
              )}
            />
          </div>
        )}

        <ExternalLink size="xs" href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#features">
          Documentation link
        </ExternalLink>
      </div>
    </div>
  )
}

export default ScalewayFeatures
