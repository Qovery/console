import { render } from '__tests__/utils/setup-jest'
import { clusterFactoryMock } from '@qovery/shared/factories'
import PageSettingsNetworkFeature, { deleteRoutes } from './page-settings-network-feature'

const clusterRoutingTable = clusterFactoryMock(1)[0].routingTable?.items

describe('PageSettingsNetworkFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsNetworkFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a delete route function', () => {
    if (clusterRoutingTable) {
      const cloneRoutes = deleteRoutes(clusterRoutingTable, clusterRoutingTable[0].destination)
      expect(cloneRoutes).toStrictEqual([])
    }
  })
})
