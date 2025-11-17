import { type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { type ClusterFeaturesData } from '@qovery/shared/interfaces'
import { BlockContent, ExternalLink, Icon, InputSelect, InputToggle, Tooltip } from '@qovery/shared/ui'

// Hardcoded Scaleway NAT Gateway types
const SCALEWAY_NAT_GATEWAY_TYPES = [
  { label: 'VPC-GW-S', value: 'VPC-GW-S' },
  { label: 'VPC-GW-M', value: 'VPC-GW-M' },
  { label: 'VPC-GW-L', value: 'VPC-GW-L' },
  { label: 'VPC-GW-XL', value: 'VPC-GW-XL' },
]

export interface ScalewayStaticIpProps {
  staticIpFeature?: ClusterFeatureResponse
  natGatewayFeature?: ClusterFeatureResponse
  disabled?: boolean
}

export function ScalewayStaticIp({ staticIpFeature, natGatewayFeature, disabled = false }: ScalewayStaticIpProps) {
  const { control, watch, setValue } = useFormContext<ClusterFeaturesData>()

  const isEditable = !disabled
  const staticIpEnabled = staticIpFeature?.id ? watch(`features.${staticIpFeature.id}.value`) : false
  const natGatewayType = natGatewayFeature?.id ? watch(`features.${natGatewayFeature.id}.extendedValue`) : undefined

  // When Static IP is disabled, also disable NAT_GATEWAY
  useEffect(() => {
    if (isEditable && !staticIpEnabled && natGatewayFeature?.id && setValue) {
      setValue(`features.${natGatewayFeature.id}.value`, false)
    }
  }, [staticIpEnabled, isEditable, natGatewayFeature?.id, setValue])

  return (
    <BlockContent title="Static IP / Nat Gateways" classNameContent="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Controller
            name={`features.${staticIpFeature?.id}.value`}
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                <InputToggle
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    // When enabling Static IP, set default NAT Gateway type if not already set
                    if (value && natGatewayFeature?.id && !natGatewayType && setValue) {
                      const defaultType = SCALEWAY_NAT_GATEWAY_TYPES[0].value
                      setValue(`features.${natGatewayFeature.id}.extendedValue`, defaultType)
                      setValue(`features.${natGatewayFeature.id}.value`, true)
                    }
                  }}
                  disabled={disabled}
                  title="Static IP / Nat Gateways"
                  description="Your cluster will only be visible from a fixed number of public IP. On Scaleway, Nat Gateways and Elastic IPs will be setup."
                  forceAlignTop
                  small
                />
                {staticIpFeature?.is_cloud_provider_paying_feature && (
                  <Tooltip content="Billed by Scaleway">
                    <ExternalLink
                      as="button"
                      href={staticIpFeature.cloud_provider_feature_documentation ?? undefined}
                      className="relative -top-1 gap-1 px-1.5"
                      color="neutral"
                      variant="surface"
                      size="xs"
                      radius="full"
                    >
                      <Icon iconName="dollar-sign" iconStyle="solid" className="text-xs" />
                      <Icon name="SCW" height="16" width="16" pathColor="#FFFFFF" />
                    </ExternalLink>
                  </Tooltip>
                )}
              </div>
            )}
          />
        </div>

        {natGatewayFeature && (
          <div className="ml-8">
            {isEditable ? (
              <Controller
                name={`features.${natGatewayFeature.id}.extendedValue`}
                control={control}
                defaultValue={(() => {
                  const value = natGatewayFeature.value_object?.value
                  // Handle object format: {"nat_gateway_type": {"provider": "scaleway", "type": "VPC-GP-M"}}
                  if (value && typeof value === 'object' && 'nat_gateway_type' in value) {
                    return (
                      (
                        value as {
                          nat_gateway_type: {
                            type: string
                          }
                        }
                      ).nat_gateway_type?.type || SCALEWAY_NAT_GATEWAY_TYPES[0].value
                    )
                  }
                  // Handle string format
                  return typeof value === 'string' ? value : SCALEWAY_NAT_GATEWAY_TYPES[0].value
                })()}
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
                    disabled={disabled || !staticIpEnabled}
                    portal
                  />
                )}
              />
            ) : (
              <InputSelect
                label="NAT Gateway Type"
                options={SCALEWAY_NAT_GATEWAY_TYPES}
                value={(() => {
                  const value = natGatewayFeature.value_object?.value
                  // Handle object format: {"nat_gateway_type": {"provider": "scaleway", "type": "VPC-GP-M"}}
                  if (value && typeof value === 'object' && 'nat_gateway_type' in value) {
                    return (
                      (
                        value as {
                          nat_gateway_type: {
                            type: string
                          }
                        }
                      ).nat_gateway_type?.type || SCALEWAY_NAT_GATEWAY_TYPES[0].value
                    )
                  }
                  // Handle string format
                  return typeof value === 'string' ? value : undefined
                })()}
                disabled
              />
            )}
          </div>
        )}

        <ExternalLink size="xs" href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#features">
          Documentation link
        </ExternalLink>
      </div>
    </BlockContent>
  )
}

export default ScalewayStaticIp
