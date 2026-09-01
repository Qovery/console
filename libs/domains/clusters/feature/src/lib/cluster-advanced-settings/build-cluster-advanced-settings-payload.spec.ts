import { buildClusterAdvancedSettingsPayload } from './build-cluster-advanced-settings-payload'

describe('buildClusterAdvancedSettingsPayload', () => {
  it('should preserve already flattened settings', () => {
    expect(
      buildClusterAdvancedSettingsPayload({
        'cluster.setting': '1.0',
      })
    ).toEqual({
      'cluster.setting': 1,
    })
  })

  it('should normalize a trailing decimal point as a number', () => {
    expect(
      buildClusterAdvancedSettingsPayload({
        'cluster.setting': '1.',
      })
    ).toEqual({
      'cluster.setting': 1,
    })
  })

  it.each(['1.0', 'true', 'null', '1e3'])(
    'should preserve the JSON-parseable value %s when the setting default is a string',
    (value) => {
      expect(
        buildClusterAdvancedSettingsPayload(
          {
            'load_balancer.size': value,
          },
          {
            'load_balancer.size': 'lb-s',
          }
        )
      ).toEqual({
        'load_balancer.size': value,
      })
    }
  )

  it('should prefer nested form values over stale flattened values', () => {
    expect(
      buildClusterAdvancedSettingsPayload({
        'cluster.setting': '1',
        cluster: {
          setting: '2',
        },
      })
    ).toEqual({
      'cluster.setting': 2,
    })
  })
})
