import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { createMockTerraformResource } from '../test-fixtures/mock-terraform-resources'
import { ResourceDetails } from './resource-details'

const mockResource = createMockTerraformResource({
  provider: 'provider["registry.terraform.io/hashicorp/aws"]',
  attributes: {
    id: 'my-app-bucket',
    bucket: 'my-app-bucket',
    region: 'us-east-1',
    versioning: { enabled: true },
  },
})

describe('ResourceDetails', () => {
  it('should show empty state when no resource is selected', () => {
    renderWithProviders(<ResourceDetails resource={null} />)

    expect(screen.getByText('No resources selected')).toBeInTheDocument()
  })

  it('should display resource metadata when resource is provided', () => {
    renderWithProviders(<ResourceDetails resource={mockResource} />)

    expect(screen.getByText('app_bucket')).toBeInTheDocument()
    expect(screen.getByText('aws_s3_bucket')).toBeInTheDocument()
    expect(screen.getByText('aws_s3_bucket.app_bucket')).toBeInTheDocument()
  })

  it('should display all attributes in table', () => {
    renderWithProviders(<ResourceDetails resource={mockResource} />)

    // Check table structure
    expect(screen.getByText('Key')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()

    // Check attribute keys are displayed
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('region')).toBeInTheDocument()
  })

  it('should convert non-string attributes to JSON', () => {
    renderWithProviders(<ResourceDetails resource={mockResource} />)

    // The versioning object should be displayed as JSON string
    expect(screen.getByText(/enabled/)).toBeInTheDocument()
  })

  it('should display extracted date in readable format', () => {
    renderWithProviders(<ResourceDetails resource={mockResource} />)

    expect(screen.getByText(/2025/)).toBeInTheDocument()
  })

  it('should render table with correct structure', () => {
    renderWithProviders(<ResourceDetails resource={mockResource} />)

    // Verify table headers
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(2)
    expect(headers[0]).toHaveTextContent('Key')
    expect(headers[1]).toHaveTextContent('Value')
  })
})
