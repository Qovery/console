import * as organizationsDomain from '@qovery/domains/organizations/feature'
import * as utilDates from '@qovery/shared/util-dates'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOrganizationLabelsAnnotationsFeature from './page-organization-labels-annotations-feature'

const useAnnotationsGroupsMockSpy = jest.spyOn(organizationsDomain, 'useAnnotationsGroups') as jest.Mock
const useLabelsGroupsMockSpy = jest.spyOn(organizationsDomain, 'useLabelsGroups') as jest.Mock

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

const mockLabelsGroup = [
  {
    id: '0',
    created_at: '2024-04-08T18:51:39.836359Z',
    updated_at: '2024-04-09T08:05:09.470801Z',
    name: 'test',
    labels: [
      {
        key: 'key',
        value: 'value',
        propagate_to_cloud_provider: false,
      },
    ],
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
    useLabelsGroupsMockSpy.mockReturnValue({
      data: mockLabelsGroup,
      isFetched: true,
    })
  })

  it('should match snapshot', () => {
    jest.spyOn(utilDates, 'timeAgo').mockReturnValue('1 month')

    const { baseElement } = renderWithProviders(<PageOrganizationLabelsAnnotationsFeature />)
    expect(baseElement).toMatchSnapshot()
  })
})
