import { type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type ClusterFeatureExtendedValue, type ClusterFeaturesData } from '@qovery/shared/interfaces'
import { BlockContent, Callout, ExternalLink, Icon, InputText, InputToggle, Tooltip } from '@qovery/shared/ui'
import { type GcpNatGatewaySettings, getGcpNatGatewaySettings } from '../utils/get-gcp-nat-gateway-settings'

const DEFAULT_STATIC_IPS_COUNT = 2
const GCP_NETWORK_DOCUMENTATION_URL =
  'https://www.qovery.com/docs/configuration/integrations/kubernetes/gke/managed#network'

const isGcpNatGatewaySettings = (value: unknown): value is GcpNatGatewaySettings =>
  Boolean(
    value &&
      typeof value === 'object' &&
      'static_ips_enabled' in value &&
      typeof value.static_ips_enabled === 'boolean' &&
      'static_ips_count' in value &&
      typeof value.static_ips_count === 'number'
  )

const sanitizeStaticIpsCount = (value: number) => Math.max(1, Math.trunc(value))

const getStaticIpValueFromFeature = (feature?: ClusterFeatureResponse) =>
  typeof feature?.value_object?.value === 'boolean' ? feature.value_object.value : undefined

export interface GcpStaticIpProps {
  staticIpFeature?: ClusterFeatureResponse
  natGatewayFeature?: ClusterFeatureResponse
  disabled?: boolean
  staticIpToggleDisabled?: boolean
  showDowntimeWarning?: boolean
  production: boolean
}

export function GcpStaticIp({
  staticIpFeature,
  natGatewayFeature,
  production,
  disabled = false,
  staticIpToggleDisabled = false,
  showDowntimeWarning = false,
}: GcpStaticIpProps) {
  const { control, watch, setValue } = useFormContext<ClusterFeaturesData>()

  const isEditable = !disabled
  const staticIpValueFromFeature = getStaticIpValueFromFeature(staticIpFeature)
  const staticIpEnabled = staticIpFeature?.id
    ? watch(`features.${staticIpFeature.id}.value`) ?? staticIpValueFromFeature ?? false
    : false
  const natGatewayValueFromFeature = getGcpNatGatewaySettings(natGatewayFeature)
  const natGatewayEnabled = natGatewayFeature?.id
    ? watch(`features.${natGatewayFeature.id}.value`) ?? Boolean(natGatewayValueFromFeature)
    : false
  const natGatewayExtendedValue = natGatewayFeature?.id
    ? (watch(`features.${natGatewayFeature.id}.extendedValue`) as ClusterFeatureExtendedValue | undefined)
    : undefined

  const natGatewaySettings = isGcpNatGatewaySettings(natGatewayExtendedValue)
    ? natGatewayExtendedValue
    : natGatewayValueFromFeature
  const staticIpsEnabled = natGatewaySettings?.static_ips_enabled ?? false
  const staticIpsCount = natGatewaySettings?.static_ips_count ?? DEFAULT_STATIC_IPS_COUNT

  const setNatGatewaySettings = (settings: GcpNatGatewaySettings) => {
    if (!natGatewayFeature?.id) return
    setValue(`features.${natGatewayFeature.id}.value`, true, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    setValue(`features.${natGatewayFeature.id}.extendedValue`, settings, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  useEffect(() => {
    if (!isEditable || !natGatewayFeature?.id || !setValue) return

    if (!staticIpEnabled) {
      if (natGatewayEnabled) {
        setValue(`features.${natGatewayFeature.id}.value`, false)
      }
      if (natGatewaySettings) {
        setValue(`features.${natGatewayFeature.id}.extendedValue`, undefined)
      }
      return
    }

    if (!natGatewayEnabled) {
      setValue(`features.${natGatewayFeature.id}.value`, true)
    }

    if (!natGatewaySettings) {
      setValue(`features.${natGatewayFeature.id}.value`, true, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
      setValue(
        `features.${natGatewayFeature.id}.extendedValue`,
        { static_ips_enabled: false, static_ips_count: DEFAULT_STATIC_IPS_COUNT },
        { shouldDirty: true, shouldTouch: true, shouldValidate: true }
      )
    }
  }, [isEditable, natGatewayEnabled, natGatewayFeature?.id, natGatewaySettings, setValue, staticIpEnabled])

  return (
    <BlockContent title="Static IP / Nat Gateways" classNameContent="w-full p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Controller
            name={`features.${staticIpFeature?.id}.value`}
            control={control}
            defaultValue={staticIpValueFromFeature ?? production}
            render={({ field }) => (
              <div className="flex w-full items-start justify-between gap-2">
                <div className="flex-1">
                  <InputToggle
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value)
                      if (!natGatewayFeature?.id || !setValue) return
                      if (!value) {
                        setValue(`features.${natGatewayFeature.id}.value`, false)
                        setValue(`features.${natGatewayFeature.id}.extendedValue`, undefined)
                        return
                      }
                      setNatGatewaySettings({
                        static_ips_enabled: natGatewaySettings?.static_ips_enabled ?? false,
                        static_ips_count: natGatewaySettings?.static_ips_count ?? DEFAULT_STATIC_IPS_COUNT,
                      })
                    }}
                    disabled={disabled || staticIpToggleDisabled}
                    title="Static IP / Nat Gateways"
                    description="Your cluster will use NAT Gateways for egress. You can configure static egress IPs below."
                    align="top"
                    small
                  />
                </div>
                {staticIpFeature?.is_cloud_provider_paying_feature && (
                  <Tooltip content="Billed by GCP">
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
                      <Icon name="GCP" height="16" width="16" pathColor="#FFFFFF" />
                    </ExternalLink>
                  </Tooltip>
                )}
              </div>
            )}
          />
        </div>

        {staticIpEnabled && natGatewayFeature && (
          <div className="flex flex-col gap-4">
            <InputToggle
              value={staticIpsEnabled}
              onChange={(value) =>
                setNatGatewaySettings({
                  static_ips_enabled: value,
                  static_ips_count: sanitizeStaticIpsCount(staticIpsCount),
                })
              }
              disabled={disabled}
              title="Enable static egress IPs"
              description="Allocate static egress IP addresses on the NAT Gateway."
              align="top"
              small
            />
            {staticIpsEnabled && (
              <InputText
                name="static_ips_count"
                label="Static IP count"
                type="number"
                value={sanitizeStaticIpsCount(staticIpsCount)}
                disabled={disabled}
                onChange={(event) => {
                  const parsedValue = Number.parseInt(event.currentTarget.value, 10)
                  setNatGatewaySettings({
                    static_ips_enabled: staticIpsEnabled,
                    static_ips_count: Number.isNaN(parsedValue)
                      ? DEFAULT_STATIC_IPS_COUNT
                      : sanitizeStaticIpsCount(parsedValue),
                  })
                }}
              />
            )}
            {showDowntimeWarning && (
              <Callout.Root color="yellow">
                <Callout.Icon>
                  <Icon iconName="triangle-exclamation" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>Changing this setting may cause downtime</Callout.TextHeading>
                  <Callout.TextDescription>
                    Enabling or disabling static egress IPs may trigger a downtime of a few minutes while the NAT
                    gateway is reconfigured.
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            )}
          </div>
        )}

        <ExternalLink size="xs" href={GCP_NETWORK_DOCUMENTATION_URL}>
          Documentation link
        </ExternalLink>
      </div>
    </BlockContent>
  )
}

export default GcpStaticIp
