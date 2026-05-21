import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ResourceTreeList, type ResourceTreeResource } from './resource-tree-list'

function createResource(overrides: Partial<ResourceTreeResource> = {}): ResourceTreeResource {
  return {
    id: 'res-1',
    resourceType: 'aws_s3_bucket',
    name: 'app_bucket',
    address: 'aws_s3_bucket.app_bucket',
    displayName: 'S3 Bucket',
    attributes: {
      id: 'my-app-bucket',
      bucket: 'my-app-bucket',
      region: 'us-east-1',
    },
    ...overrides,
  }
}

const mockResources = [
  createResource({ id: 'res-1', name: 'app_bucket' }),
  createResource({
    id: 'res-2',
    resourceType: 'aws_rds_instance',
    name: 'app_db',
    address: 'aws_rds_instance.app_db',
    displayName: 'RDS Instance',
    attributes: { id: 'mydb', engine: 'mysql', db_name: 'appdb' },
  }),
  createResource({
    id: 'res-3',
    name: 'backup_bucket',
    address: 'aws_s3_bucket.backup_bucket',
    attributes: { id: 'my-backup-bucket', bucket: 'my-backup-bucket', region: 'us-west-2' },
  }),
]

describe('ResourceTreeList', () => {
  const mockOnSelectResource = jest.fn()

  beforeEach(() => {
    mockOnSelectResource.mockClear()
  })

  it('should render empty state when no resources', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={[]}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery=""
      />
    )

    expect(screen.getByText('No result for this search')).toBeInTheDocument()
  })

  it('should group resources by type', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery=""
      />
    )

    expect(screen.getByText(/RDS Instance/)).toBeInTheDocument()
    expect(screen.getByText(/S3 Bucket/)).toBeInTheDocument()
  })

  it('should highlight selected resource', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId="res-1"
        onSelectResource={mockOnSelectResource}
        searchQuery=""
      />
    )

    const selectedButton = screen.getByRole('button', { name: /app_bucket/ })
    expect(selectedButton).toHaveClass('bg-surface-brand-component')
  })

  it('should call onSelectResource when clicking a resource', async () => {
    const { userEvent } = renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery=""
      />
    )

    const resourceButton = screen.getByRole('button', { name: /app_bucket/ })
    await userEvent.click(resourceButton)

    expect(mockOnSelectResource).toHaveBeenCalledWith('res-1')
  })

  it('should keep matching and non-matching resources visible when searching by name', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery="backup"
      />
    )

    expect(screen.getByText('backup_bucket')).toBeInTheDocument()
    expect(screen.getByText('app_bucket')).toBeInTheDocument()
  })

  it('should match resources when searching by type', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery="rds"
      />
    )

    expect(screen.getByText('app_db')).toBeInTheDocument()
  })

  it('should match resources when searching by attribute keys', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery="engine"
      />
    )

    expect(screen.getByText('app_db')).toBeInTheDocument()
  })

  it('should match resources when searching by attribute values', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery="mysql"
      />
    )

    expect(screen.getByText('app_db')).toBeInTheDocument()
  })

  it('should show no results message when search returns nothing', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery="nonexistent"
      />
    )

    expect(screen.getByText('No resources match')).toBeInTheDocument()
  })

  it('should sort resources by name within each group', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery=""
      />
    )

    const bucketButtons = screen.getAllByRole('button').filter((btn) => btn.textContent?.includes('_bucket'))
    expect(bucketButtons[0]).toHaveTextContent('app_bucket')
    expect(bucketButtons[1]).toHaveTextContent('backup_bucket')
  })
})
