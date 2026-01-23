import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { createMockTerraformResource } from '../test-fixtures/mock-terraform-resources'
import { ResourceTreeList } from './resource-tree-list'

const mockResources = [
  createMockTerraformResource({
    id: 'res-1',
    name: 'app_bucket',
    provider: 'aws',
  }),
  createMockTerraformResource({
    id: 'res-2',
    resourceType: 'aws_rds_instance',
    name: 'app_db',
    address: 'aws_rds_instance.app_db',
    provider: 'aws',
    displayName: 'RDS Instance',
    attributes: { id: 'mydb', engine: 'mysql', db_name: 'appdb' },
  }),
  createMockTerraformResource({
    id: 'res-3',
    name: 'backup_bucket',
    address: 'aws_s3_bucket.backup_bucket',
    provider: 'aws',
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

    // Should show resource types with counts
    expect(screen.getByText(/RDS Instance/)).toBeInTheDocument()
    expect(screen.getByText(/\(1\)/)).toBeInTheDocument()
    expect(screen.getByText(/S3 Bucket/)).toBeInTheDocument()
    expect(screen.getByText(/\(2\)/)).toBeInTheDocument()
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
    expect(selectedButton).toHaveClass('bg-brand-50')
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

  it('should highlight matching resources when searching by name', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery="backup"
      />
    )

    // All resources should be visible, but non-matching ones are dimmed
    expect(screen.getByText('backup_bucket')).toBeInTheDocument()
    expect(screen.getByText('app_bucket')).toBeInTheDocument()

    // Non-matching button should have dimmed styling
    const nonMatchingButton = screen.getByRole('button', { name: /app_bucket/ })
    expect(nonMatchingButton).toHaveClass('text-neutral-250')
  })

  it('should highlight matching resources when searching by type', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery="rds"
      />
    )

    expect(screen.getByText('app_db')).toBeInTheDocument()
    // Non-matching resources are visible but dimmed
    const nonMatchingButton = screen.getByRole('button', { name: /app_bucket/ })
    expect(nonMatchingButton).toHaveClass('text-neutral-250')
  })

  it('should highlight matching resources when searching by attribute keys', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery="engine"
      />
    )

    expect(screen.getByText('app_db')).toBeInTheDocument()
    // Non-matching resources are visible but dimmed
    const nonMatchingButton = screen.getByRole('button', { name: /app_bucket/ })
    expect(nonMatchingButton).toHaveClass('text-neutral-250')
  })

  it('should highlight matching resources when searching by attribute values', () => {
    renderWithProviders(
      <ResourceTreeList
        resources={mockResources}
        selectedResourceId={null}
        onSelectResource={mockOnSelectResource}
        searchQuery="mysql"
      />
    )

    expect(screen.getByText('app_db')).toBeInTheDocument()
    // Non-matching resources are visible but dimmed
    const nonMatchingButton = screen.getByRole('button', { name: /app_bucket/ })
    expect(nonMatchingButton).toHaveClass('text-neutral-250')
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

    // Get only the resource buttons (those containing bucket names), not tree triggers
    const bucketButtons = screen.getAllByRole('button').filter((btn) => btn.textContent?.includes('_bucket'))
    // Should have app_bucket before backup_bucket alphabetically
    expect(bucketButtons[0]).toHaveTextContent('app_bucket')
    expect(bucketButtons[1]).toHaveTextContent('backup_bucket')
  })
})
