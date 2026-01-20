import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useTerraformResourcesModule from '../hooks/use-terraform-resources/use-terraform-resources'
import { createMockTerraformResource } from '../test-fixtures/mock-terraform-resources'
import { TerraformResourcesSection } from './terraform-resources-section'

jest.mock('../hooks/use-terraform-resources/use-terraform-resources')

const mockUseTerraformResources = jest.spyOn(useTerraformResourcesModule, 'useTerraformResources')

describe('TerraformResourcesSection', () => {
  const terraformId = 'test-terraform-id'
  const mockResource = createMockTerraformResource({
    id: '1',
    resourceType: 'aws_instance',
    name: 'web_server',
    address: 'aws_instance.web_server',
    displayName: 'EC2 Instance',
    attributes: { instance_type: 't3.micro' },
    extractedAt: '2024-01-14T10:00:00Z',
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state', () => {
    mockUseTerraformResources.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithProviders(<TerraformResourcesSection terraformId={terraformId} />)

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should render error state with message', () => {
    const errorMessage = 'Failed to fetch resources'
    mockUseTerraformResources.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error(errorMessage),
    } as any)

    renderWithProviders(<TerraformResourcesSection terraformId={terraformId} />)

    expect(screen.getByText(/Failed to load terraform resources/i)).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should render empty state when no resources', () => {
    mockUseTerraformResources.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<TerraformResourcesSection terraformId={terraformId} />)

    expect(screen.getByText(/No infrastructure resources found/i)).toBeInTheDocument()
  })

  it('should render resources with tree list and details', () => {
    mockUseTerraformResources.mockReturnValue({
      data: [mockResource],
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<TerraformResourcesSection terraformId={terraformId} />)

    // Resource should be shown in tree list (may appear in both tree and details)
    expect(screen.getAllByText('web_server').length).toBeGreaterThan(0)
    expect(screen.getByText('EC2 Instance')).toBeInTheDocument()
  })

  it('should render split panel with resources', () => {
    const resources = [mockResource]
    mockUseTerraformResources.mockReturnValue({
      data: resources,
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<TerraformResourcesSection terraformId={terraformId} />)

    expect(screen.getByText('EC2 Instance')).toBeInTheDocument()
    expect(screen.getAllByText('web_server').length).toBeGreaterThan(0)
  })

  it('should select first resource on load', () => {
    mockUseTerraformResources.mockReturnValue({
      data: [mockResource],
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<TerraformResourcesSection terraformId={terraformId} />)

    expect(screen.getByText('aws_instance.web_server')).toBeInTheDocument()
  })

  it('should dim non-matching resources when searching', async () => {
    const resources = [
      mockResource,
      createMockTerraformResource({
        id: '2',
        name: 'data_bucket',
        resourceType: 'aws_s3_bucket',
        displayName: 'S3 Bucket',
        address: 'aws_s3_bucket.data_bucket',
      }),
    ]

    mockUseTerraformResources.mockReturnValue({
      data: resources,
      isLoading: false,
      error: null,
    } as any)

    const { userEvent } = renderWithProviders(<TerraformResourcesSection terraformId={terraformId} />)

    const searchInput = screen.getByPlaceholderText(/Search resources/i)
    await userEvent.type(searchInput, 'bucket')

    // Both resources are visible in tree, but non-matching one is dimmed
    expect(screen.getAllByText('data_bucket').length).toBeGreaterThan(0)
    expect(screen.getAllByText('web_server').length).toBeGreaterThan(0)

    // Non-matching resource should have dimmed styling
    const nonMatchingButton = screen.getByRole('button', { name: /web_server/ })
    expect(nonMatchingButton).toHaveClass('text-neutral-250')
  })

  it('should show empty search state when no matches', async () => {
    mockUseTerraformResources.mockReturnValue({
      data: [mockResource],
      isLoading: false,
      error: null,
    } as any)

    const { userEvent } = renderWithProviders(<TerraformResourcesSection terraformId={terraformId} />)

    const searchInput = screen.getByPlaceholderText(/Search resources/i)
    await userEvent.type(searchInput, 'nonexistent')

    expect(screen.getByText('No resources match')).toBeInTheDocument()
  })

  it('should display multiple resources', () => {
    const resources = [
      mockResource,
      createMockTerraformResource({
        id: '2',
        name: 'db_instance',
        resourceType: 'aws_db_instance',
        displayName: 'RDS Instance',
      }),
    ]

    mockUseTerraformResources.mockReturnValue({
      data: resources,
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<TerraformResourcesSection terraformId={terraformId} />)

    expect(screen.getByText('EC2 Instance')).toBeInTheDocument()
    expect(screen.getByText('RDS Instance')).toBeInTheDocument()
  })
})
