import { type ClusterFeatureResponse, ClusterFeatureResponseTypeEnum } from 'qovery-typescript-axios'
import { getGcpNatGatewaySettings } from './get-gcp-nat-gateway-settings'

const makeFeature = (value: object | null): ClusterFeatureResponse => ({
  id: 'NAT_GATEWAY',
  value_object: {
    type: ClusterFeatureResponseTypeEnum.NAT_GATEWAY,
    value,
  },
})

describe('getGcpNatGatewaySettings', () => {
  it('should return settings when value has GCP nat_gateway_type shape', () => {
    expect(
      getGcpNatGatewaySettings(
        makeFeature({
          nat_gateway_type: {
            provider: 'gcp',
            static_ips_enabled: true,
            static_ips_count: 3,
          },
        })
      )
    ).toEqual({
      static_ips_enabled: true,
      static_ips_count: 3,
    })
  })

  it('should return undefined for Scaleway nat_gateway_type shape', () => {
    expect(
      getGcpNatGatewaySettings(
        makeFeature({
          nat_gateway_type: {
            provider: 'scaleway',
            type: 'VPC-GW-S',
          },
        })
      )
    ).toBeUndefined()
  })

  it('should return undefined for null, undefined, or non-NAT_GATEWAY feature', () => {
    expect(getGcpNatGatewaySettings(undefined)).toBeUndefined()
    expect(
      getGcpNatGatewaySettings({
        id: 'STATIC_IP',
        value_object: { type: ClusterFeatureResponseTypeEnum.BOOLEAN, value: true },
      })
    ).toBeUndefined()
  })

  it('should return undefined when nat_gateway_type is null or missing', () => {
    expect(getGcpNatGatewaySettings(makeFeature(null))).toBeUndefined()
    expect(getGcpNatGatewaySettings(makeFeature({ nat_gateway_type: null }))).toBeUndefined()
  })
})
