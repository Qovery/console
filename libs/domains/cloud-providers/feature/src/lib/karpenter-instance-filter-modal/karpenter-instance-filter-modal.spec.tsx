import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { KarpenterInstanceFilterModal } from './karpenter-instance-filter-modal'

jest.mock('../hooks/use-cloud-provider-instance-types-karpenter/use-cloud-provider-instance-types-karpenter', () => {
  return {
    ...jest.requireActual(
      '../hooks/use-cloud-provider-instance-types-karpenter/use-cloud-provider-instance-types-karpenter'
    ),
    useCloudProviderInstanceTypesKarpenter: () => ({
      data: [
        {
          type: 'c6g.16xlarge',
          name: 'c6g.16xlarge',
          cpu: 64,
          ram_in_gb: 128,
          bandwidth_in_gbps: '',
          bandwidth_guarantee: '',
          architecture: 'ARM64',
          gpu_info: null,
          attributes: {
            instance_category: 'c',
            instance_generation: 6,
            instance_family: 'c6g',
            instance_size: '16xlarge',
            meets_resource_reqs: true,
          },
        },
        {
          type: 'm5ad.xlarge',
          name: 'm5ad.xlarge',
          cpu: 64,
          ram_in_gb: 256,
          bandwidth_in_gbps: '',
          bandwidth_guarantee: '',
          architecture: 'AMD64',
          gpu_info: null,
          attributes: {
            instance_category: 'm',
            instance_generation: 5,
            instance_family: 'm5ad',
            instance_size: 'xlarge',
            meets_resource_reqs: true,
          },
        },
      ],
    }),
  }
})

describe('KarpenterInstanceFilterModal', () => {
  it('renders form with instance types data', async () => {
    renderWithProviders(
      <KarpenterInstanceFilterModal clusterRegion="us-east-1" onChange={jest.fn()} onClose={jest.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByText('Karpenter Instance Visual filter')).toBeInTheDocument()
      expect(screen.getByText('Architecture')).toBeInTheDocument()
      expect(screen.getByLabelText('AMD64')).toBeInTheDocument()
      expect(screen.getByLabelText('ARM64')).toBeInTheDocument()
      expect(screen.getByLabelText('16xlarge')).toBeInTheDocument()
    })
  })

  it('submits form with selected instance types and architectures', async () => {
    const mockOnChange = jest.fn()
    const mockOnClose = jest.fn()

    const { userEvent, debug, baseElement } = renderWithProviders(
      <KarpenterInstanceFilterModal clusterRegion="us-east-1" onChange={mockOnChange} onClose={mockOnClose} />
    )

    const amd64Checkbox = screen.getByLabelText('AMD64')
    await userEvent.click(amd64Checkbox)

    const sizeLargeCheckbox = screen.getByLabelText('xlarge')
    await userEvent.click(sizeLargeCheckbox)

    const categoryButton = screen.getByText('M - General Purpose')
    await userEvent.click(categoryButton)

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await userEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        default_service_architecture: 'ARM64',
        qovery_node_pools: {
          requirements: [
            { key: 'InstanceSize', operator: 'In', values: ['16xlarge'] },
            { key: 'InstanceFamily', operator: 'In', values: ['c6g'] },
            { key: 'Arch', operator: 'In', values: ['ARM64'] },
          ],
        },
      })
    })

    expect(mockOnClose).toHaveBeenCalled()
  })
})
