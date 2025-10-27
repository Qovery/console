import { type ClusterFeatureResponse } from 'qovery-typescript-axios'
import {
  getClusterFeatureValue,
  getClusterFeatureValueType,
  isClusterFeatureEnabled,
} from './get-cluster-feature-value'

describe('getClusterFeatureValue', () => {
  it('should handle old format with boolean value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'BOOLEAN',
        value: true,
      },
    } as ClusterFeatureResponse

    expect(getClusterFeatureValue(feature)).toBe(true)
  })

  it('should handle old format with string value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'VPC_SUBNET',
      value_object: {
        type: 'STRING',
        value: '10.0.0.0/16',
      },
    } as ClusterFeatureResponse

    expect(getClusterFeatureValue(feature)).toBe('10.0.0.0/16')
  })

  it('should handle new format with nested boolean value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'STATIC_IP',
        value: {
          type: 'common',
          value: true,
          is_enabled: true,
        },
      },
    } as unknown as ClusterFeatureResponse

    expect(getClusterFeatureValue(feature)).toBe(true)
  })

  it('should handle new format with Scaleway static IP', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'STATIC_IP',
        value: {
          type: 'scaleway',
          value: true,
          is_enabled: true,
          gateway_type: 'VPC_GW_M',
          dhcp_subnet_cidr: '172.16.0.0/24',
        },
      },
    } as unknown as ClusterFeatureResponse

    expect(getClusterFeatureValue(feature)).toBe(true)
  })

  it('should return undefined when value_object is null', () => {
    const feature: ClusterFeatureResponse = {
      id: 'EXISTING_VPC',
      value_object: null,
    } as ClusterFeatureResponse

    expect(getClusterFeatureValue(feature)).toBeUndefined()
  })

  it('should return undefined when value_object is undefined', () => {
    const feature: ClusterFeatureResponse = {
      id: 'EXISTING_VPC',
    } as ClusterFeatureResponse

    expect(getClusterFeatureValue(feature)).toBeUndefined()
  })

  it('should handle old format with false boolean value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'BOOLEAN',
        value: false,
      },
    } as ClusterFeatureResponse

    expect(getClusterFeatureValue(feature)).toBe(false)
  })

  it('should handle old format with empty string value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'OPTIONAL_CONFIG',
      value_object: {
        type: 'STRING',
        value: '',
      },
    } as ClusterFeatureResponse

    expect(getClusterFeatureValue(feature)).toBe('')
  })

  it('should handle new format with nested string value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'VPC_SUBNET',
      value_object: {
        type: 'VPC_CONFIG',
        value: {
          value: '192.168.0.0/16',
        },
      },
    } as unknown as ClusterFeatureResponse

    expect(getClusterFeatureValue(feature)).toBe('192.168.0.0/16')
  })

  it('should handle new format with nested false boolean value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'STATIC_IP',
        value: {
          type: 'common',
          value: false,
          is_enabled: false,
        },
      },
    } as unknown as ClusterFeatureResponse

    expect(getClusterFeatureValue(feature)).toBe(false)
  })
})

describe('isClusterFeatureEnabled', () => {
  it('should return true for old format with boolean true', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'BOOLEAN',
        value: true,
      },
    } as ClusterFeatureResponse

    expect(isClusterFeatureEnabled(feature)).toBe(true)
  })

  it('should return false for old format with boolean false', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'BOOLEAN',
        value: false,
      },
    } as ClusterFeatureResponse

    expect(isClusterFeatureEnabled(feature)).toBe(false)
  })

  it('should return true for old format with string value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'VPC_SUBNET',
      value_object: {
        type: 'STRING',
        value: '10.0.0.0/16',
      },
    } as ClusterFeatureResponse

    expect(isClusterFeatureEnabled(feature)).toBe(true)
  })

  it('should return true for new format when is_enabled is true', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'STATIC_IP',
        value: {
          type: 'common',
          value: true,
          is_enabled: true,
        },
      },
    } as unknown as ClusterFeatureResponse

    expect(isClusterFeatureEnabled(feature)).toBe(true)
  })

  it('should return false for new format when is_enabled is false', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'STATIC_IP',
        value: {
          type: 'common',
          value: false,
          is_enabled: false,
        },
      },
    } as unknown as ClusterFeatureResponse

    expect(isClusterFeatureEnabled(feature)).toBe(false)
  })

  it('should return false when value_object is null', () => {
    const feature: ClusterFeatureResponse = {
      id: 'EXISTING_VPC',
      value_object: null,
    } as ClusterFeatureResponse

    expect(isClusterFeatureEnabled(feature)).toBe(false)
  })

  it('should return false when value_object is undefined', () => {
    const feature: ClusterFeatureResponse = {
      id: 'EXISTING_VPC',
    } as ClusterFeatureResponse

    expect(isClusterFeatureEnabled(feature)).toBe(false)
  })

  it('should return false when value is undefined', () => {
    const feature: ClusterFeatureResponse = {
      id: 'EXISTING_VPC',
      value_object: {
        type: 'UNKNOWN',
        value: undefined,
      },
    } as unknown as ClusterFeatureResponse

    expect(isClusterFeatureEnabled(feature)).toBe(false)
  })

  it('should return false when value is null', () => {
    const feature: ClusterFeatureResponse = {
      id: 'EXISTING_VPC',
      value_object: {
        type: 'UNKNOWN',
        value: null,
      },
    } as unknown as ClusterFeatureResponse

    expect(isClusterFeatureEnabled(feature)).toBe(false)
  })

  it('should return true for old format with empty string value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'OPTIONAL_CONFIG',
      value_object: {
        type: 'STRING',
        value: '',
      },
    } as ClusterFeatureResponse

    expect(isClusterFeatureEnabled(feature)).toBe(true)
  })
})

describe('getClusterFeatureValueType', () => {
  it('should return "boolean" for old format with boolean value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'BOOLEAN',
        value: true,
      },
    } as ClusterFeatureResponse

    expect(getClusterFeatureValueType(feature)).toBe('boolean')
  })

  it('should return "string" for old format with string value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'VPC_SUBNET',
      value_object: {
        type: 'STRING',
        value: '10.0.0.0/16',
      },
    } as ClusterFeatureResponse

    expect(getClusterFeatureValueType(feature)).toBe('string')
  })

  it('should return "boolean" for new format with nested boolean value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'STATIC_IP',
        value: {
          type: 'common',
          value: true,
          is_enabled: true,
        },
      },
    } as unknown as ClusterFeatureResponse

    expect(getClusterFeatureValueType(feature)).toBe('boolean')
  })

  it('should return undefined when value_object is null', () => {
    const feature: ClusterFeatureResponse = {
      id: 'EXISTING_VPC',
      value_object: null,
    } as ClusterFeatureResponse

    expect(getClusterFeatureValueType(feature)).toBeUndefined()
  })

  it('should return undefined when value_object is undefined', () => {
    const feature: ClusterFeatureResponse = {
      id: 'EXISTING_VPC',
    } as ClusterFeatureResponse

    expect(getClusterFeatureValueType(feature)).toBeUndefined()
  })

  it('should return "boolean" for new format with nested false boolean value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'STATIC_IP',
      value_object: {
        type: 'STATIC_IP',
        value: {
          type: 'common',
          value: false,
          is_enabled: false,
        },
      },
    } as unknown as ClusterFeatureResponse

    expect(getClusterFeatureValueType(feature)).toBe('boolean')
  })

  it('should return "string" for new format with nested string value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'VPC_SUBNET',
      value_object: {
        type: 'VPC_CONFIG',
        value: {
          value: '10.0.0.0/16',
          is_enabled: true,
        },
      },
    } as unknown as ClusterFeatureResponse

    expect(getClusterFeatureValueType(feature)).toBe('string')
  })

  it('should return "string" for empty string value', () => {
    const feature: ClusterFeatureResponse = {
      id: 'OPTIONAL_CONFIG',
      value_object: {
        type: 'STRING',
        value: '',
      },
    } as ClusterFeatureResponse

    expect(getClusterFeatureValueType(feature)).toBe('string')
  })
})
