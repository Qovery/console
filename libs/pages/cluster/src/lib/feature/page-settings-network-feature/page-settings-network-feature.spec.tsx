import { render } from '__tests__/utils/setup-jest'
import PageSettingsNetworkFeature, { deleteRoutes } from './page-settings-network-feature'

jest.mock('@qovery/domains/clusters/feature', () => ({
  ...jest.requireActual('@qovery/domains/clusters/feature'),
  useClusterRoutingTable: () => ({
    data: [
      {
        destination: '10.0.0.0/16',
        target: 'pcx-0abf',
        description: 'my description',
      },
    ],
  }),
}))

describe('PageSettingsNetworkFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsNetworkFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a delete route function', () => {
    const routes = [
      {
        destination: '10.0.0.0/16',
        target: 'pcx-0abf',
        description: 'my description',
      },
    ]
    const cloneRoutes = deleteRoutes(routes, routes[0].destination)
    expect(cloneRoutes).toStrictEqual([])
  })
})
