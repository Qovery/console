import { OrganizationAnnotationsGroupScopeEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useAnnotationsGroups } from '../hooks/use-annotations-groups/use-annotations-groups'
import { useLabelsGroups } from '../hooks/use-labels-groups/use-labels-groups'
import { SettingsLabelsAnnotations } from './settings-labels-annotations'

jest.mock('../hooks/use-annotations-groups/use-annotations-groups')
jest.mock('../hooks/use-labels-groups/use-labels-groups')

const useAnnotationsGroupsMock = useAnnotationsGroups as jest.MockedFunction<typeof useAnnotationsGroups>
const useLabelsGroupsMock = useLabelsGroups as jest.MockedFunction<typeof useLabelsGroups>

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
    scopes: [
      OrganizationAnnotationsGroupScopeEnum.DEPLOYMENTS,
      OrganizationAnnotationsGroupScopeEnum.STATEFUL_SETS,
      OrganizationAnnotationsGroupScopeEnum.INGRESS,
    ],
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

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '1' }),
}))

describe('SettingsLabelsAnnotations', () => {
  beforeEach(() => {
    useAnnotationsGroupsMock.mockReturnValue({
      data: mockAnnotationsGroup,
      isFetched: true,
    } as ReturnType<typeof useAnnotationsGroups>)
    useLabelsGroupsMock.mockReturnValue({
      data: mockLabelsGroup,
      isFetched: true,
    } as ReturnType<typeof useLabelsGroups>)
  })

  it('should render labels and annotations groups', () => {
    renderWithProviders(<SettingsLabelsAnnotations />)

    expect(screen.getByText('Labels & annotations')).toBeInTheDocument()
    expect(screen.getByText('Add new')).toBeInTheDocument()
    expect(screen.getAllByText('test')[0]).toBeInTheDocument()
  })
})
