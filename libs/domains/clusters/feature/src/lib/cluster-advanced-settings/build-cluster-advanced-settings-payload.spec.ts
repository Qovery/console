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
