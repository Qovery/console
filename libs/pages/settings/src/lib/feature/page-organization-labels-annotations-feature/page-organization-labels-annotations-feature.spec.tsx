import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOrganizationLabelsAnnotationsFeature from './page-organization-labels-annotations-feature'

const useAnnotationsGroupsMockSpy = jest.spyOn(organizationsDomain, 'useAnnotationsGroups') as jest.Mock

const mockAnnotationsGroup = [
  {
    id: '0',
    created_at: '2024-04-08T18:51:39.836359Z',
    updated_at: '2024-04-09T08:05:09.470801Z',
    name: 'test',
    annotations: [
      {
        key: 'key',
        value: 'value',
      },
    ],
    scopes: ['PERSISTENT_VOLUME_CLAIMS', 'REPLICA_SETS', 'INGRESS'],
  },
]

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

describe('PageOrganizationLabelsAnnotationsFeature', () => {
  beforeEach(() => {
    useAnnotationsGroupsMockSpy.mockReturnValue({
      data: mockAnnotationsGroup,
      isFetched: true,
    })
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationLabelsAnnotationsFeature />)
    expect(baseElement).toMatchSnapshot()
  })
})
