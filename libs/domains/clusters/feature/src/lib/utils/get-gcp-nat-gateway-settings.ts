import { type ClusterFeatureNatGatewayTypeGcp, type ClusterFeatureResponse } from 'qovery-typescript-axios'

export type GcpNatGatewaySettings = {
  static_ips_enabled: boolean
  static_ips_count: number
}

export const getGcpNatGatewaySettings = (feature?: ClusterFeatureResponse): GcpNatGatewaySettings | undefined => {
  const valueObj = feature?.value_object
  if (valueObj?.type !== 'NAT_GATEWAY') return undefined
  const natGatewayType = valueObj.value?.nat_gateway_type
  if (natGatewayType && natGatewayType.provider === 'gcp') {
    const { static_ips_enabled, static_ips_count } = natGatewayType as ClusterFeatureNatGatewayTypeGcp
    return { static_ips_enabled, static_ips_count }
  }
  return undefined
}
