import { type OrganizationAnnotationsGroupAssociatedItemsResponseListResultsInner } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAnnotationsGroupAssociatedItems from '../hooks/use-annotations-group-associated-items/use-annotations-group-associated-items'
import * as useLabelsGroupAssociatedItems from '../hooks/use-labels-group-associated-items/use-labels-group-associated-items'
import {
  LabelAnnotationItemsListModal,
  type LabelAnnotationItemsListModalProps,
  filterClustersForAssociatedItemsModal,
  getServiceAssociatedItems,
  groupByProjectEnvironmentsServices,
} from './label-annotation-items-list-modal'

const useAnnotationsGroupAssociatedItemsSpy = jest.spyOn(
  useAnnotationsGroupAssociatedItems,
  'useAnnotationsGroupAssociatedItems'
) as jest.Mock

const useLabelsGroupAssociatedItemsSpy = jest.spyOn(
  useLabelsGroupAssociatedItems,
  'useLabelsGroupAssociatedItems'
) as jest.Mock

const props: LabelAnnotationItemsListModalProps = {
  type: 'annotation',
  organizationId: '0000-0000-0000',
  groupId: '0000-0000-0000',
  onClose: jest.fn(),
  associatedItemsCount: 3,
}

const data: OrganizationAnnotationsGroupAssociatedItemsResponseListResultsInner[] = [
  {
    project_id: '1',
    project_name: 'Project 1',
    environment_id: '1',
    environment_name: 'Development',
    item_id: '101',
    item_name: 'Service 1',
    item_type: 'CRON',
  },
  {
    project_id: '1',
    project_name: 'Project 1',
    environment_id: '1',
    environment_name: 'Development',
    item_id: '102',
    item_name: 'Service 2',
    item_type: 'CRON',
  },
  {
    project_id: '2',
    project_name: 'Project 2',
    environment_id: '1',
    environment_name: 'Staging',
    item_id: '201',
    item_name: 'Service 3',
    item_type: 'LIFECYCLE',
  },
]

const clusterOnlyData: OrganizationAnnotationsGroupAssociatedItemsResponseListResultsInner[] = [
  {
    cluster_id: null,
    cluster_name: null,
    project_id: null,
    project_name: null,
    environment_id: null,
    environment_name: null,
    item_id: '3f50657b-1162-4dde-b706-4d5e937f3c09',
    item_name: 'cluster-for-obs-team',
    item_type: 'CLUSTER',
  },
]

describe('LabelAnnotationItemsListModal', () => {
  beforeEach(() => {
    props.type = 'annotation'
    useAnnotationsGroupAssociatedItemsSpy.mockReturnValue({
      data,
    })
    useLabelsGroupAssociatedItemsSpy.mockReturnValue({
      data,
    })
  })

  it('should group data by projects, environments, and services correctly', () => {
    const result = groupByProjectEnvironmentsServices(data)

    expect(result).toHaveLength(2)

    expect(result[0].project_id).toBe('1')
    expect(result[0].project_name).toBe('Project 1')
    expect(result[0].environments).toHaveLength(1)
    expect(result[0].environments[0].environment_id).toBe('1')
    expect(result[0].environments[0].environment_name).toBe('Development')
    expect(result[0].environments[0].services).toHaveLength(2)

    expect(result[1].project_id).toBe('2')
    expect(result[1].project_name).toBe('Project 2')
    expect(result[1].environments).toHaveLength(1)
    expect(result[1].environments[0].environment_id).toBe('1')
    expect(result[1].environments[0].environment_name).toBe('Staging')
    expect(result[1].environments[0].services).toHaveLength(1)
  })

  it('should match snapshots with annotation', async () => {
    const { baseElement, userEvent } = renderWithProviders(<LabelAnnotationItemsListModal {...props} />)

    const triggers = screen.getAllByRole('button')
    screen.getByText(/project 1/i)
    await userEvent.click(triggers[0])

    const triggerEnvironment = screen.getByText(/development/i).parentElement
    await userEvent.click(triggerEnvironment!)

    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshots with label', async () => {
    const { baseElement, userEvent } = renderWithProviders(<LabelAnnotationItemsListModal {...props} type="label" />)

    const triggers = screen.getAllByRole('button')
    screen.getByText(/project 1/i)
    await userEvent.click(triggers[0])

    const triggerEnvironment = screen.getByText(/development/i).parentElement
    await userEvent.click(triggerEnvironment!)

    expect(baseElement).toMatchSnapshot()
  })

  it('should exclude CLUSTER rows when grouping services', () => {
    const mixed = [...data, ...clusterOnlyData]
    const result = groupByProjectEnvironmentsServices(getServiceAssociatedItems(mixed))

    expect(result).toHaveLength(2)
    expect(result[0].environments[0].services).toHaveLength(2)
  })

  it('should filter clusters by item_name for search', () => {
    expect(filterClustersForAssociatedItemsModal(clusterOnlyData, 'obs')).toHaveLength(1)
    expect(filterClustersForAssociatedItemsModal(clusterOnlyData, 'nomatch')).toHaveLength(0)
  })

  it('should render only clusters section and cluster name for CLUSTER-only payload', () => {
    useAnnotationsGroupAssociatedItemsSpy.mockReturnValue({
      data: clusterOnlyData,
    })
    useLabelsGroupAssociatedItemsSpy.mockReturnValue({
      data: clusterOnlyData,
    })

    renderWithProviders(<LabelAnnotationItemsListModal {...props} type="annotation" associatedItemsCount={1} />)

    expect(screen.getByRole('heading', { name: /associated items \(1\)/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^clusters$/i })).toBeInTheDocument()
    expect(screen.getByText('cluster-for-obs-team')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /^services$/i })).not.toBeInTheDocument()
  })
})
