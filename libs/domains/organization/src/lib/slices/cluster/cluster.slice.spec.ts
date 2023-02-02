import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { clusterAdapter, clusterReducer } from './cluster.slice'

describe('cluster reducer', () => {
  it('should handle initial state', () => {
    const expected = clusterAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinOrganizationClusters: {},
      statusLoadingStatus: 'not loaded',
      defaultClusterAdvancedSettings: {
        loadingStatus: 'not loaded',
        settings: undefined,
      },
      cloudProvider: {
        loadingStatus: 'not loaded',
        items: [],
      },
      availableClusterTypes: {
        loadingStatus: 'not loaded',
        items: {
          [CloudProviderEnum.AWS]: {
            [KubernetesEnum.K3_S]: {},
            [KubernetesEnum.MANAGED]: {},
          },
          [CloudProviderEnum.SCW]: {
            [KubernetesEnum.K3_S]: {},
            [KubernetesEnum.MANAGED]: {},
          },
          [CloudProviderEnum.DO]: {
            [KubernetesEnum.K3_S]: {},
            [KubernetesEnum.MANAGED]: {},
          },
        },
      },
    })

    expect(clusterReducer(undefined, { type: '' })).toEqual(expected)
  })
})
