import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  type AssociatedItem,
  AssociatedItemsModal,
  type AssociatedItemsModalProps,
  filterClustersForAssociatedItemsModal,
  getServiceAssociatedItems,
  groupByProjectEnvironmentsServices,
} from './associated-items-modal'

const data: AssociatedItem[] = [
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

const clusterOnlyData: AssociatedItem[] = [
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

const externalSecretData: AssociatedItem[] = [
  {
    project_id: '1',
    project_name: 'Project 1',
    environment_id: '1',
    environment_name: 'Development',
    item_id: 'service-1-API_TOKEN-prod/api-token',
    item_name: 'API_TOKEN',
    item_type: 'APPLICATION',
    item_link_id: 'service-1',
    item_subtitle: 'prod/api-token',
  },
]

const baseProps: AssociatedItemsModalProps = {
  title: 'Associated items (3)',
  organizationId: '0000-0000-0000',
  items: data,
  isLoading: false,
  onClose: jest.fn(),
}

describe('AssociatedItemsModal', () => {
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

  it('should match snapshot with services', async () => {
    const { baseElement, userEvent } = renderWithProviders(<AssociatedItemsModal {...baseProps} />)

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

  it('should preserve service links and subtitles when grouping custom items', () => {
    const result = groupByProjectEnvironmentsServices(externalSecretData)

    expect(result[0].environments[0].services[0]).toMatchObject({
      service_id: 'service-1-API_TOKEN-prod/api-token',
      service_name: 'API_TOKEN',
      service_link_id: 'service-1',
      service_subtitle: 'prod/api-token',
    })
  })

  it('should render custom item label, placeholder, and subtitle', async () => {
    const { userEvent } = renderWithProviders(
      <AssociatedItemsModal
        {...baseProps}
        title="Associated external secret (1)"
        items={externalSecretData}
        itemLabel="External secret"
        searchPlaceholder="Search by project, environment, or external secret name"
      />
    )

    expect(screen.getByPlaceholderText('Search by project, environment, or external secret name')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'External secret' })).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('button')[0])
    await userEvent.click(screen.getAllByRole('button')[1])

    expect(screen.getByText('API_TOKEN')).toBeInTheDocument()
    expect(screen.getByText('prod/api-token')).toBeInTheDocument()
  })

  it('should filter clusters by item_name for search', () => {
    expect(filterClustersForAssociatedItemsModal(clusterOnlyData, 'obs')).toHaveLength(1)
    expect(filterClustersForAssociatedItemsModal(clusterOnlyData, 'nomatch')).toHaveLength(0)
  })

  it('should render only clusters section and cluster name for CLUSTER-only payload', () => {
    renderWithProviders(<AssociatedItemsModal {...baseProps} title="Associated item (1)" items={clusterOnlyData} />)

    expect(screen.getByRole('heading', { name: /associated item \(1\)/i })).toBeInTheDocument()
    expect(screen.getByText('cluster-for-obs-team')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /^services$/i })).not.toBeInTheDocument()
  })

  it('should show loading spinner when isLoading is true', () => {
    renderWithProviders(<AssociatedItemsModal {...baseProps} items={[]} isLoading={true} />)

    expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument()
  })

  it('should show empty state when items is empty and not loading', () => {
    renderWithProviders(<AssociatedItemsModal {...baseProps} items={[]} isLoading={false} />)

    expect(screen.getByText('No value found')).toBeInTheDocument()
  })
})
